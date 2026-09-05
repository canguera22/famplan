import { createClient } from "npm:@supabase/supabase-js@2";
import {
  createOpenAIResponse,
  responseText,
  safetyIdentifier,
  type OpenAIResponseItem,
} from "../_shared/openai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WEBHOOK_URL = Deno.env.get("TWILIO_WEBHOOK_URL") ?? "";
const TIME_ZONE = "Europe/Madrid";
const INTERPRETER_MODEL = "gpt-5.6-luna";
const CONVERSATION_MODEL = "gpt-5.6-terra";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function twiml(message?: string): Response {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(message)}</Message></Response>`
    : '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

function base64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function validTwilioSignature(request: Request, form: FormData): Promise<boolean> {
  if (!TWILIO_AUTH_TOKEN || !TWILIO_WEBHOOK_URL) return false;
  const received = request.headers.get("x-twilio-signature") ?? "";
  const params = Array.from(form.entries())
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right));
  const payload = TWILIO_WEBHOOK_URL + params.map(([key, value]) => `${key}${value}`).join("");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(TWILIO_AUTH_TOKEN),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const expected = base64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (received.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < received.length; index += 1) {
    difference |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function madridDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day! + amount));
  return date.toISOString().slice(0, 10);
}

function validDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validClock(value: string | null): boolean {
  return value === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function likelyCompoundRequest(value: string): boolean {
  return (
    /\b(?:two|three|four|five)\s+(?:tasks?|items?|events?)\b/i.test(value) ||
    /\bthe following\b/i.test(value) ||
    /[;\n]/.test(value) ||
    /\.\s+(?:add|buy|create|schedule|remind|assign|update|call|book)\b/i.test(value) ||
    /\b(?:and then|then)\s+(?:add|buy|create|schedule|remind|assign|complete|mark)\b/i.test(value)
  );
}

function likelyNamedListRequest(value: string): boolean {
  return /\b(?:to|on|in)\s+(?:the\s+|my\s+)?[^\n,.;]+$/iu.test(value);
}

function zonedDateAt(dateKey: string, hour: number, minute = 0): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const desired = Date.UTC(year!, month! - 1, day!, hour, minute);
  let guess = desired;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]),
    );
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    guess += desired - represented;
  }
  return new Date(guess).toISOString();
}

function madridTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function recordReply(
  incomingSid: string,
  familyId: string | null,
  identityId: string | null,
  body: string,
) {
  await supabase.from("whatsapp_messages").upsert({
    message_sid: `${incomingSid}:reply`,
    family_id: familyId,
    identity_id: identityId,
    direction: "outbound",
    body,
    status: "sent_via_twiml",
  });
}

async function respond(
  incomingSid: string,
  familyId: string | null,
  identityId: string | null,
  message: string,
): Promise<Response> {
  await recordReply(incomingSid, familyId, identityId, message);
  return twiml(message);
}

async function pairPhone(
  code: string,
  address: string,
  phone: string,
  profileName: string,
  incomingSid: string,
): Promise<Response> {
  const { data: pairing, error: pairingError } = await supabase
    .from("whatsapp_pairing_codes")
    .select("id, family_id, person_id, expires_at")
    .eq("code", code)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pairingError || !pairing) {
    return respond(
      incomingSid,
      null,
      null,
      "That Mesa link code is invalid or expired. Create a new one in Mesa Settings.",
    );
  }

  const { data: person } = await supabase
    .from("people")
    .select("display_name")
    .eq("id", pairing.person_id)
    .single();
  const { data: identity, error: identityError } = await supabase
    .from("whatsapp_identities")
    .upsert(
      {
        family_id: pairing.family_id,
        person_id: pairing.person_id,
        whatsapp_address: address,
        display_phone: phone,
        profile_name: profileName || null,
        active: true,
        linked_at: new Date().toISOString(),
      },
      { onConflict: "whatsapp_address" },
    )
    .select("id")
    .single();
  if (identityError) {
    console.error("WhatsApp identity link failed", identityError);
    return twiml("Mesa could not link this phone. Please try a fresh code.");
  }

  await supabase
    .from("whatsapp_pairing_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", pairing.id);

  return respond(
    incomingSid,
    pairing.family_id,
    identity.id,
    `Connected to Mesa as ${person?.display_name ?? "a family member"}. Send “help” to see what I can do.`,
  );
}

async function todaySummary(identity: Record<string, string>): Promise<string> {
  const today = madridDateKey(new Date());
  return agendaForDates(identity, today, today, "Today");
}

async function addTask(
  identity: Record<string, string>,
  rawTitle: string,
  destination: "tasks" | "shopping" = "tasks",
): Promise<string> {
  const nowKey = madridDateKey(new Date());
  const wantsTomorrow = /\btomorrow\b/i.test(rawTitle);
  const wantsToday = /\btoday\b/i.test(rawTitle);
  const dueKey = wantsTomorrow ? addDays(nowKey, 1) : wantsToday ? nowKey : null;
  const title = rawTitle
    .replace(/\b(today|tomorrow)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!title) {
    return destination === "shopping"
      ? "Tell me what to buy—for example: buy Milk"
      : "Tell me what to add—for example: add Sign school form tomorrow";
  }

  const listQuery = supabase.from("lists").select("id, name").eq("family_id", identity.family_id);
  const selectedListQuery =
    destination === "shopping"
      ? listQuery.ilike("name", "Things to buy").limit(1).single()
      : listQuery.order("position").limit(1).single();
  const [{ data: list }, { data: person }, { data: family }] = await Promise.all([
    selectedListQuery,
    supabase.from("people").select("user_id").eq("id", identity.person_id).single(),
    supabase.from("families").select("created_by").eq("id", identity.family_id).single(),
  ]);
  if (!list || !family) {
    return destination === "shopping"
      ? "Mesa could not find your Things to buy list. Open Mesa once, then try again."
      : "Mesa could not find your family task board.";
  }
  const createdBy = person?.user_id ?? family.created_by;
  const dueAt = dueKey ? zonedDateAt(dueKey, 9) : null;
  const { data: card, error } = await supabase
    .from("list_cards")
    .insert({
      family_id: identity.family_id,
      list_id: list.id,
      title,
      status: "assigned",
      assignee_id: identity.person_id,
      due_at: dueAt,
      all_day: true,
      show_on_calendar: Boolean(dueAt),
      created_by: createdBy,
    })
    .select("id")
    .single();
  if (error || !card) {
    console.error("WhatsApp task insert failed", error);
    return "Mesa could not add that task. Please try again.";
  }
  const destinationLabel = destination === "shopping" ? " to Things to buy" : "";
  return `Added “${title}”${destinationLabel} and assigned it to you${dueKey ? ` for ${wantsTomorrow ? "tomorrow" : "today"}` : ""}. Ref ${card.id.slice(0, 8)}.`;
}

async function completeTask(identity: Record<string, string>, query: string): Promise<string> {
  const search = query.trim();
  if (!search) return "Tell me which task—for example: done Buy milk";
  const { data: matches, error } = await supabase
    .from("list_cards")
    .select("id, title")
    .eq("family_id", identity.family_id)
    .neq("status", "done")
    .ilike("title", `%${search.replaceAll("%", "")}%`)
    .limit(3);
  if (error || !matches?.length) return `I couldn’t find an open task matching “${search}”.`;
  if (matches.length > 1)
    return `I found more than one match: ${matches.map((task) => task.title).join(", ")}. Be more specific.`;

  const { data: person } = await supabase
    .from("people")
    .select("user_id")
    .eq("id", identity.person_id)
    .single();
  const { data: family } = await supabase
    .from("families")
    .select("created_by")
    .eq("id", identity.family_id)
    .single();
  const { error: updateError } = await supabase
    .from("list_cards")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      completed_by: person?.user_id ?? family?.created_by,
    })
    .eq("id", matches[0].id);
  if (updateError) return "Mesa could not complete that task. Please try again.";
  return `Done — “${matches[0].title}”.`;
}

async function creatorId(identity: Record<string, string>): Promise<string | null> {
  const [{ data: person }, { data: family }] = await Promise.all([
    supabase.from("people").select("user_id").eq("id", identity.person_id).single(),
    supabase.from("families").select("created_by").eq("id", identity.family_id).single(),
  ]);
  return person?.user_id ?? family?.created_by ?? null;
}

async function personIdFor(
  identity: Record<string, string>,
  requested: string | null,
): Promise<string | null> {
  if (!requested) return null;
  if (/^(me|myself)$/i.test(requested.trim())) return identity.person_id;
  const { data: people } = await supabase
    .from("people")
    .select("id, display_name")
    .eq("family_id", identity.family_id)
    .eq("active", true);
  const lowered = requested.trim().toLowerCase();
  return (
    people?.find((person) => person.display_name.toLowerCase() === lowered)?.id ??
    people?.find((person) => person.display_name.toLowerCase().includes(lowered))?.id ??
    null
  );
}

async function agendaSummary(
  identity: Record<string, string>,
  range: "today" | "tomorrow" | "week",
): Promise<string> {
  const today = madridDateKey(new Date());
  const startKey = range === "tomorrow" ? addDays(today, 1) : today;
  const days = range === "week" ? 7 : 1;
  const endKey = addDays(startKey, days - 1);
  const label = range === "week" ? "Next seven days" : range[0]!.toUpperCase() + range.slice(1);
  return agendaForDates(identity, startKey, endKey, label);
}

type AgendaEventRow = {
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  assignee_id: string | null;
  recurrence_rule: string | null;
};

function madridClock(value: string): [number, number] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );
  return [Number(parts.hour), Number(parts.minute)];
}

function nextRecurringDate(
  currentKey: string,
  frequency: string,
  baseDay: number,
  baseMonth: number,
): string {
  if (frequency === "DAILY") return addDays(currentKey, 1);
  if (frequency === "WEEKLY") return addDays(currentKey, 7);
  const [year, month] = currentKey.split("-").map(Number);
  if (frequency === "MONTHLY") {
    const target = new Date(Date.UTC(year!, month!, 1));
    const lastDay = new Date(
      Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
    ).getUTCDate();
    return `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, "0")}-${String(Math.min(baseDay, lastDay)).padStart(2, "0")}`;
  }
  const nextYear = year! + 1;
  const lastDay = new Date(Date.UTC(nextYear, baseMonth, 0)).getUTCDate();
  return `${nextYear}-${String(baseMonth).padStart(2, "0")}-${String(Math.min(baseDay, lastDay)).padStart(2, "0")}`;
}

function expandEventRows(
  rows: AgendaEventRow[],
  startKey: string,
  endKey: string,
): AgendaEventRow[] {
  const rangeStart = new Date(zonedDateAt(startKey, 0));
  const rangeEnd = new Date(zonedDateAt(addDays(endKey, 1), 0));
  const output: AgendaEventRow[] = [];

  for (const row of rows) {
    const frequency = row.recurrence_rule?.match(/FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/)?.[1];
    const originalKey = madridDateKey(row.starts_at);
    const [, baseMonth, baseDay] = originalKey.split("-").map(Number);
    const [hour, minute] = madridClock(row.starts_at);
    const duration = new Date(row.ends_at).getTime() - new Date(row.starts_at).getTime();
    const allDaySpan = Math.max(
      1,
      Math.round(
        (Date.parse(`${madridDateKey(row.ends_at)}T00:00:00Z`) -
          Date.parse(`${originalKey}T00:00:00Z`)) /
          86_400_000,
      ),
    );
    let occurrenceKey = originalKey;
    let guard = 0;

    while (guard < 10_000) {
      const occurrenceStart = new Date(zonedDateAt(occurrenceKey, hour, minute));
      const occurrenceEnd = row.all_day
        ? new Date(zonedDateAt(addDays(occurrenceKey, allDaySpan), 0))
        : new Date(occurrenceStart.getTime() + duration);
      if (occurrenceStart < rangeEnd && occurrenceEnd > rangeStart) {
        output.push({
          ...row,
          starts_at: occurrenceStart.toISOString(),
          ends_at: occurrenceEnd.toISOString(),
        });
      }
      if (!frequency || occurrenceStart >= rangeEnd) break;
      occurrenceKey = nextRecurringDate(occurrenceKey, frequency, baseDay!, baseMonth!);
      guard += 1;
    }
  }

  return output.sort((left, right) => left.starts_at.localeCompare(right.starts_at));
}

async function agendaForDates(
  identity: Record<string, string>,
  startKey: string,
  endKey: string,
  label = startKey === endKey ? startKey : `${startKey} to ${endKey}`,
): Promise<string> {
  if (!validDateKey(startKey) || !validDateKey(endKey)) return "I need a valid agenda date.";
  const span =
    (Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) / 86_400_000;
  if (span < 0 || span > 14) return "I can show an agenda range of up to 15 days.";
  const start = zonedDateAt(startKey, 0);
  const end = zonedDateAt(addDays(endKey, 1), 0);
  const [eventsResult, recurringEventsResult, tasksResult] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("title, starts_at, ends_at, all_day, assignee_id, recurrence_rule")
      .eq("family_id", identity.family_id)
      .is("recurrence_rule", null)
      .lt("starts_at", end)
      .gt("ends_at", start)
      .order("starts_at")
      .limit(100),
    supabase
      .from("calendar_events")
      .select("title, starts_at, ends_at, all_day, assignee_id, recurrence_rule")
      .eq("family_id", identity.family_id)
      .not("recurrence_rule", "is", null)
      .lt("starts_at", end)
      .order("starts_at", { ascending: false })
      .limit(100),
    supabase
      .from("list_cards")
      .select("title, due_at, assignee_id")
      .eq("family_id", identity.family_id)
      .neq("status", "done")
      .not("due_at", "is", null)
      .gte("due_at", start)
      .lt("due_at", end)
      .order("due_at")
      .limit(30),
  ]);
  const events = expandEventRows(
    [...(eventsResult.data ?? []), ...(recurringEventsResult.data ?? [])],
    startKey,
    endKey,
  ).slice(0, 30);
  const tasks = tasksResult.data ?? [];
  if (!events.length && !tasks.length) return `${label} is clear.`;
  const showDates = startKey !== endKey;
  const lines = [`${label} in Mesa:`];
  for (const event of events) {
    const day = madridDateKey(event.starts_at);
    lines.push(
      `• ${showDates ? `${day} · ` : ""}${event.all_day ? "All day" : madridTime(event.starts_at)} — ${event.title}`,
    );
  }
  for (const task of tasks) {
    const day = madridDateKey(task.due_at!);
    lines.push(`• ${showDates ? `${day} · ` : ""}Task — ${task.title}`);
  }
  return lines.join("\n");
}

async function taskList(
  identity: Record<string, string>,
  scope: "mine" | "open" | "all",
  listName: string | null,
): Promise<string> {
  const lists = await activeLists(identity.family_id);
  const resolution = listName ? resolveList(lists, listName) : null;
  if (resolution?.error) return resolution.error;
  const wanted = resolution?.list ?? null;
  let query = supabase
    .from("list_cards")
    .select("title, status, due_at, assignee_id, list_id")
    .eq("family_id", identity.family_id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(50);
  if (scope !== "all") query = query.neq("status", "done");
  if (scope === "mine") query = query.eq("assignee_id", identity.person_id);
  if (wanted) query = query.eq("list_id", wanted.id);
  const { data: tasks, error } = await query;
  if (error) return "I couldn’t read the family lists just now.";
  if (!tasks?.length) return wanted ? `${wanted.name} is clear.` : "Your lists are clear.";
  const listMap = new Map(lists.map((list) => [list.id, list.name]));
  const heading = wanted ? `${wanted.name}:` : "Open items across your lists:";
  return [
    heading,
    ...tasks.map((task, index) => {
      const due = task.due_at ? ` · due ${madridDateKey(task.due_at)}` : "";
      const marker = task.status === "done" ? "✓" : "☐";
      const listLabel = wanted ? "" : ` · ${listMap.get(task.list_id) ?? "List"}`;
      return `${index + 1}. ${marker} ${task.title}${listLabel}${due}`;
    }),
  ].join("\n");
}

type ActiveList = { id: string; name: string; description: string; position: number };

async function activeLists(familyId: string): Promise<ActiveList[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("id, name, description, position")
    .eq("family_id", familyId)
    .is("archived_at", null)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

function comparableListName(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\blist\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function resolveList(
  lists: ActiveList[],
  requestedName: string,
): { list: ActiveList | null; error: string | null } {
  const requested = comparableListName(requestedName);
  if (!requested) {
    return { list: null, error: "Tell me the exact name of the list." };
  }
  const alias =
    requested === "family tasks"
      ? lists.find((list) => comparableListName(list.name) !== "things to buy")
      : requested === "things to buy"
        ? lists.find((list) => comparableListName(list.name) === "things to buy")
        : null;
  if (alias) return { list: alias, error: null };
  const exact = lists.find((list) => comparableListName(list.name) === requested);
  if (exact) return { list: exact, error: null };
  const partial = lists.filter((list) => {
    const candidate = comparableListName(list.name);
    return candidate.includes(requested) || requested.includes(candidate);
  });
  if (partial.length === 1) return { list: partial[0]!, error: null };
  if (partial.length > 1) {
    return {
      list: null,
      error: `I found more than one matching list: ${partial.map((list) => list.name).join(", ")}. Use the exact name.`,
    };
  }
  return {
    list: null,
    error: `I couldn’t find a list named “${requestedName.trim()}”. You can say “create a ${requestedName.trim()} list”.`,
  };
}

async function createList(
  identity: Record<string, string>,
  args: { name: string; description: string | null },
): Promise<string> {
  const name = args.name.trim().replace(/\s+/g, " ");
  if (!name) return "Tell me what to call the new list.";
  if (name.length > 60) return "Keep the list name under 60 characters.";
  const lists = await activeLists(identity.family_id);
  const duplicate = lists.find(
    (list) => comparableListName(list.name) === comparableListName(name),
  );
  if (duplicate) return `The ${duplicate.name} list already exists.`;
  const createdBy = await creatorId(identity);
  if (!createdBy) return "Mesa could not identify who is creating that list.";
  const colors = ["green", "blue", "amber"];
  const position = lists.reduce((highest, list) => Math.max(highest, list.position), -1) + 1;
  const { error } = await supabase.from("lists").insert({
    family_id: identity.family_id,
    name,
    description: args.description?.trim().slice(0, 160) ?? "",
    color: colors[lists.length % colors.length],
    position,
    created_by: createdBy,
  });
  if (error) {
    console.error("WhatsApp list insert failed", error);
    return "Mesa could not create that list.";
  }
  return `Created the ${name} list. You can add items to it anytime.`;
}

async function clearList(identity: Record<string, string>, listName: string): Promise<string> {
  const resolution = resolveList(await activeLists(identity.family_id), listName);
  if (resolution.error || !resolution.list)
    return resolution.error ?? "Mesa could not find that list.";
  const { count, error } = await supabase
    .from("list_cards")
    .delete({ count: "exact" })
    .eq("family_id", identity.family_id)
    .eq("list_id", resolution.list.id);
  if (error) {
    console.error("WhatsApp list clear failed", error);
    return `Mesa could not clear ${resolution.list.name}.`;
  }
  return count
    ? `Cleared ${count} ${count === 1 ? "item" : "items"} from ${resolution.list.name}. The list is ready to reuse.`
    : `${resolution.list.name} is already clear.`;
}

async function createTaskFromTool(
  identity: Record<string, string>,
  args: {
    title: string;
    dueDate: string | null;
    assigneeName: string | null;
    listName: string;
  },
): Promise<string> {
  const title = args.title.trim();
  if (!title) return "A task title is required.";
  if (title.length > 200) return "That task title is too long.";
  if (args.dueDate && !validDateKey(args.dueDate)) return "I need a valid task date.";
  const resolution = resolveList(await activeLists(identity.family_id), args.listName);
  if (resolution.error || !resolution.list)
    return resolution.error ?? "Mesa could not find that family list.";
  const list = resolution.list;
  const assigneeId = await personIdFor(identity, args.assigneeName);
  if (args.assigneeName && !assigneeId)
    return `I couldn’t find a family member named “${args.assigneeName}”.`;
  const createdBy = await creatorId(identity);
  if (!createdBy) return "Mesa could not identify who is creating that task.";
  const dueAt = args.dueDate ? zonedDateAt(args.dueDate, 9) : null;
  const { error } = await supabase.from("list_cards").insert({
    family_id: identity.family_id,
    list_id: list.id,
    title,
    status: assigneeId ? "assigned" : "open",
    assignee_id: assigneeId,
    due_at: dueAt,
    all_day: true,
    show_on_calendar: Boolean(dueAt),
    created_by: createdBy,
  });
  if (error) {
    console.error("AI task insert failed", error);
    return "Mesa could not add that task.";
  }
  return `Added “${title}” to ${list.name}${assigneeId ? ` and assigned it to ${args.assigneeName}` : ""}${args.dueDate ? ` for ${args.dueDate}` : ""}.`;
}

async function assignTask(
  identity: Record<string, string>,
  queryText: string,
  assigneeName: string,
): Promise<string> {
  const assigneeId = await personIdFor(identity, assigneeName);
  if (!assigneeId) return `I couldn’t find a family member named “${assigneeName}”.`;
  const { data: matches } = await supabase
    .from("list_cards")
    .select("id, title")
    .eq("family_id", identity.family_id)
    .neq("status", "done")
    .ilike("title", `%${queryText.replaceAll("%", "")}%`)
    .limit(3);
  if (!matches?.length) return `I couldn’t find an open task matching “${queryText}”.`;
  if (matches.length > 1)
    return `I found several matches: ${matches.map((task) => task.title).join(", ")}.`;
  const { error } = await supabase
    .from("list_cards")
    .update({ status: "assigned", assignee_id: assigneeId })
    .eq("id", matches[0].id);
  return error
    ? "Mesa could not assign that task."
    : `Assigned “${matches[0].title}” to ${assigneeName}.`;
}

async function createEvent(
  identity: Record<string, string>,
  args: {
    title: string;
    startDate: string;
    endDate: string | null;
    startTime: string | null;
    recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
    assigneeName: string | null;
  },
): Promise<string> {
  if (!args.title.trim()) return "An event title is required.";
  if (args.title.trim().length > 200) return "That event title is too long.";
  if (!validDateKey(args.startDate) || (args.endDate && !validDateKey(args.endDate)))
    return "I need a valid event date or date range.";
  if (args.endDate && args.endDate < args.startDate)
    return "The event end date must be on or after its start date.";
  if (!validClock(args.startTime)) return "Use a valid 24-hour event start time.";
  const createdBy = await creatorId(identity);
  if (!createdBy) return "Mesa could not identify who is creating that event.";
  const assigneeId = await personIdFor(identity, args.assigneeName);
  if (args.assigneeName && !assigneeId)
    return `I couldn’t find a family member named “${args.assigneeName}”.`;
  const timeParts = (args.startTime ?? "00:00").split(":").map(Number);
  const startsAt = zonedDateAt(args.startDate, timeParts[0] ?? 0, timeParts[1] ?? 0);
  const finalDate = args.endDate ?? args.startDate;
  let endsAt: string;
  if (!args.startTime) endsAt = zonedDateAt(addDays(finalDate, 1), 0);
  else {
    const finalStart = zonedDateAt(finalDate, timeParts[0] ?? 0, timeParts[1] ?? 0);
    endsAt = new Date(new Date(finalStart).getTime() + 60 * 60 * 1000).toISOString();
  }
  if (new Date(endsAt) <= new Date(startsAt))
    return "The event end time must be after its start time.";
  const { error } = await supabase.from("calendar_events").insert({
    family_id: identity.family_id,
    title: args.title.trim(),
    starts_at: startsAt,
    ends_at: endsAt,
    all_day: !args.startTime,
    assignee_id: assigneeId,
    recurrence_rule: args.recurrence === "none" ? null : `FREQ=${args.recurrence.toUpperCase()}`,
    source_type: "manual",
    created_by: createdBy,
  });
  if (error) {
    console.error("AI calendar event insert failed", error);
    return "Mesa could not add that calendar event.";
  }
  const dateLabel = args.endDate ? `${args.startDate} through ${args.endDate}` : args.startDate;
  const repeatLabel = args.recurrence === "none" ? "" : `, repeating ${args.recurrence}`;
  return `Added “${args.title.trim()}” to the family calendar for ${dateLabel}${args.startTime ? ` at ${args.startTime}` : ""}${repeatLabel}.`;
}

const whatsappTools = [
  {
    type: "function",
    name: "get_agenda",
    description:
      "Read family calendar events and due tasks for a named range or exact inclusive date range.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        range: { type: ["string", "null"], enum: ["today", "tomorrow", "week", null] },
        dateFrom: { type: ["string", "null"], description: "YYYY-MM-DD, or null" },
        dateTo: { type: ["string", "null"], description: "YYYY-MM-DD inclusive, or null" },
      },
      required: ["range", "dateFrom", "dateTo"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "list_tasks",
    description:
      "Read items from any named Mesa list, or across lists when listName is null. Use mine for items assigned to this WhatsApp user.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        scope: { type: "string", enum: ["mine", "open", "all"] },
        listName: {
          type: ["string", "null"],
          description: "The user's list name, such as Things to buy or Costco, or null",
        },
      },
      required: ["scope", "listName"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "create_task",
    description:
      "Create one item on a named Mesa list. Use the exact list name from the user when supplied.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        dueDate: { type: ["string", "null"], description: "YYYY-MM-DD, or null" },
        assigneeName: {
          type: ["string", "null"],
          description: "Family member name, 'me', or null for unassigned",
        },
        listName: {
          type: "string",
          description:
            "List name. Default to Family tasks, or Things to buy for unspecified shopping requests.",
        },
      },
      required: ["title", "dueDate", "assigneeName", "listName"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "create_list",
    description:
      "Create a new reusable family list. Do not call this when the user only wants an item added.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The new list name without the word list when possible",
        },
        description: {
          type: ["string", "null"],
          description: "Optional short description, or null",
        },
      },
      required: ["name", "description"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "clear_list",
    description: "Remove every item from one named list while preserving the reusable list itself.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        listName: { type: "string", description: "Exact list name to empty" },
      },
      required: ["listName"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "complete_task",
    description: "Mark one existing task or shopping item done using words from its title.",
    strict: true,
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "assign_task",
    description: "Assign an existing open task to a family member.",
    strict: true,
    parameters: {
      type: "object",
      properties: { query: { type: "string" }, assigneeName: { type: "string" } },
      required: ["query", "assigneeName"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "create_event",
    description:
      "Create a single or recurring family calendar event. Date ranges are inclusive. Use null startTime for an all-day event.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        startDate: { type: "string", description: "YYYY-MM-DD" },
        endDate: {
          type: ["string", "null"],
          description: "Inclusive YYYY-MM-DD end date for a multi-day event, or null",
        },
        startTime: { type: ["string", "null"], description: "24-hour HH:MM, or null" },
        recurrence: {
          type: "string",
          enum: ["none", "daily", "weekly", "monthly", "yearly"],
        },
        assigneeName: { type: ["string", "null"] },
      },
      required: ["title", "startDate", "endDate", "startTime", "recurrence", "assigneeName"],
      additionalProperties: false,
    },
  },
];

async function executeWhatsappTool(
  identity: Record<string, string>,
  call: OpenAIResponseItem,
): Promise<string> {
  const args = JSON.parse(call.arguments ?? "{}") as Record<string, string | null>;
  switch (call.name) {
    case "get_agenda": {
      if (args.dateFrom && args.dateTo) return agendaForDates(identity, args.dateFrom, args.dateTo);
      if (args.range) return agendaSummary(identity, args.range as "today" | "tomorrow" | "week");
      return "Tell me which date or date range you want to see.";
    }
    case "list_tasks":
      return taskList(identity, args.scope as "mine" | "open" | "all", args.listName);
    case "create_task":
      return createTaskFromTool(identity, args as Parameters<typeof createTaskFromTool>[1]);
    case "create_list":
      return createList(identity, args as Parameters<typeof createList>[1]);
    case "clear_list":
      return clearList(identity, String(args.listName ?? ""));
    case "complete_task":
      return completeTask(identity, String(args.query ?? ""));
    case "assign_task":
      return assignTask(identity, String(args.query ?? ""), String(args.assigneeName ?? ""));
    case "create_event":
      return createEvent(identity, args as Parameters<typeof createEvent>[1]);
    default:
      return "That action is not available in Mesa.";
  }
}

async function aiWhatsappReply(identity: Record<string, string>): Promise<string> {
  const [{ data: history }, { data: person }] = await Promise.all([
    supabase
      .from("whatsapp_messages")
      .select("direction, body")
      .eq("identity_id", identity.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("people").select("display_name").eq("id", identity.person_id).single(),
  ]);
  const messagesNewestFirst = history ?? [];
  const latestRequest = messagesNewestFirst.find(
    (message) => message.direction === "inbound",
  )?.body;
  const input: Array<Record<string, unknown>> = [...messagesNewestFirst]
    .reverse()
    .map((message) => ({
      role: message.direction === "inbound" ? "user" : "assistant",
      content: message.body,
    }));
  const safetyId = await safetyIdentifier(identity.id);
  const interpretation = await createOpenAIResponse(
    {
      model: INTERPRETER_MODEL,
      store: false,
      reasoning: { effort: "none" },
      safety_identifier: safetyId,
      instructions: [
        `You interpret requests for Mesa, an authenticated family planner. The current date in Europe/Madrid is ${madridDateKey(new Date())}.`,
        `The sender is ${person?.display_name ?? "the linked family member"}. Never ask for or accept family IDs, user IDs, phone numbers, passwords, or secrets.`,
        "Analyze the latest user message in conversation context. Emit one function call for every distinct requested Mesa operation, up to five calls.",
        "A request for two tasks must produce two create_task calls. Never combine separate tasks, shopping items, or events into one title.",
        "For task titles, preserve only the actionable title. Remove wrappers such as 'add the following tasks' and remove due-date or assignment phrases after placing those values in their fields.",
        "Users can create reusable lists, add items to any list by name, read a named list, and clear a named list. Never interpret 'create a list named X' as a task.",
        "When the user names a list, pass that human-readable name exactly as listName. For an unspecified shopping request, use Things to buy. For an unspecified non-shopping task, use Family tasks.",
        "For phrases such as 'show my Costco list' or 'what is on Costco', call list_tasks with listName Costco and scope open. Use scope all only when the user explicitly asks to include completed items.",
        "Only call clear_list when the user explicitly asks to clear or empty a specific named list. Clearing removes its items but preserves the reusable list.",
        "Default new tasks to assigneeName 'me' unless the user explicitly requests another family member or says to leave the task open or unassigned.",
        "Resolve relative dates from the supplied current date. For an exact date query, use dateFrom and dateTo with the same date instead of requesting the full week.",
        "For events, never invent or request an end time. A date range is one create_event call with startDate and inclusive endDate. If no clock time is stated, use null startTime so the event is all day. Capture phrases like every day, week, month, or year in recurrence; otherwise use none.",
        "If a required date or identity is genuinely ambiguous, emit no function calls and ask one short clarification question.",
        "For conversation that needs no Mesa data or action, emit no function calls and respond naturally.",
      ].join(" "),
      input,
      tools: whatsappTools,
      tool_choice: "auto",
      parallel_tool_calls: true,
      max_output_tokens: 900,
      text: { verbosity: "low" },
    },
    7_000,
  );
  const calls = interpretation.output.filter((item) => item.type === "function_call");
  if (!calls.length)
    return responseText(interpretation) || "I’m not sure how to help with that yet.";
  if (calls.length > 5) return "I can handle up to five Mesa actions in one message.";

  const results: Array<{ action: string; result: string }> = [];
  for (const call of calls) {
    try {
      results.push({
        action: call.name ?? "unknown",
        result: await executeWhatsappTool(identity, call),
      });
    } catch (error) {
      console.error("WhatsApp planned action failed", error);
      results.push({
        action: call.name ?? "unknown",
        result: "Mesa could not complete this action.",
      });
    }
  }

  const fallback = results.map(({ result }) => `• ${result}`).join("\n");
  try {
    const conversation = await createOpenAIResponse(
      {
        model: CONVERSATION_MODEL,
        store: false,
        reasoning: { effort: "none" },
        safety_identifier: safetyId,
        instructions: [
          "You are Mesa, a warm and direct WhatsApp family assistant.",
          "Write a concise confirmation grounded only in the supplied action results.",
          "For multiple results, use a short numbered or bulleted list so every completed or failed action is explicit.",
          "Preserve task titles, dates, assignees, and failures. Never claim an action succeeded when its result says it failed.",
          "Do not mention tools, models, parsing, JSON, or internal processing. Stay under 900 characters.",
        ].join(" "),
        input: JSON.stringify({
          request: latestRequest,
          results,
        }),
        max_output_tokens: 400,
        text: { verbosity: "low" },
      },
      5_000,
    );
    return responseText(conversation) || fallback;
  } catch (error) {
    console.error("WhatsApp conversational response failed", error);
    return fallback;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Not found", { status: 404 });
  const form = await request.formData();
  if (!(await validTwilioSignature(request, form))) {
    return new Response("Invalid Twilio signature", { status: 403 });
  }

  const incomingSid = String(form.get("MessageSid") ?? "");
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "").trim();
  const profileName = String(form.get("ProfileName") ?? "");
  const phone = String(form.get("WaId") ?? from.replace("whatsapp:", ""));
  if (!incomingSid || !from) return new Response("Malformed webhook", { status: 400 });

  const { data: existing } = await supabase
    .from("whatsapp_messages")
    .select("message_sid")
    .eq("message_sid", incomingSid)
    .maybeSingle();
  if (existing) return twiml();

  const { data: identity } = await supabase
    .from("whatsapp_identities")
    .select("id, family_id, person_id")
    .eq("whatsapp_address", from)
    .eq("active", true)
    .maybeSingle();
  await supabase.from("whatsapp_messages").insert({
    message_sid: incomingSid,
    family_id: identity?.family_id ?? null,
    identity_id: identity?.id ?? null,
    direction: "inbound",
    body,
    status: "received",
    metadata: { profile_name: profileName },
  });

  const linkMatch = body.match(/^link\s+([a-f0-9]{6})$/i);
  if (linkMatch)
    return pairPhone(linkMatch[1]!.toUpperCase(), from, phone, profileName, incomingSid);

  if (!identity) {
    return respond(
      incomingSid,
      null,
      null,
      "This phone is not linked to a Mesa family yet. Open Mesa → Settings → WhatsApp, create a code, then send: link CODE",
    );
  }

  const normalized = body.toLowerCase();
  let reply: string;
  if (normalized === "help" || normalized === "hello" || normalized === "hi") {
    reply = [
      "Ask Mesa naturally, or use a shortcut:",
      "• today / tomorrow / week",
      "• list / shopping list / my tasks",
      "• buy Milk",
      "• add Sign school form tomorrow",
      "• done Milk",
      "• create a Costco list",
      "• add Paper towels to Costco",
      "• show my Costco list",
      "• clear my Costco list",
      "You can add up to five tasks or events in one message.",
      "You can also say: “Add football Friday at 17:00” or “Assign the school form to Maria.”",
    ].join("\n");
  } else if (normalized === "today") {
    reply = await todaySummary(identity);
  } else if (normalized === "tomorrow" || normalized === "week") {
    reply = await agendaSummary(identity, normalized);
  } else if (normalized === "list") {
    reply = await taskList(identity, "open", null);
  } else if (normalized === "shopping list") {
    reply = await taskList(identity, "open", "Things to buy");
  } else if (normalized === "my tasks") {
    reply = await taskList(identity, "mine", null);
  } else if (
    /^buy\s+/i.test(body) &&
    !likelyCompoundRequest(body) &&
    !likelyNamedListRequest(body)
  ) {
    reply = await addTask(identity, body.replace(/^buy\s+/i, ""), "shopping");
  } else if (
    /^add\s+/i.test(body) &&
    !likelyCompoundRequest(body) &&
    !likelyNamedListRequest(body)
  ) {
    const taskText = body.replace(/^add\s+/i, "");
    const isShoppingItem = /^buy\s+/i.test(taskText);
    reply = await addTask(identity, taskText, isShoppingItem ? "shopping" : "tasks");
  } else if (/^done\s+/i.test(body)) {
    reply = await completeTask(identity, body.replace(/^done\s+/i, ""));
  } else {
    try {
      reply = await aiWhatsappReply(identity);
    } catch (error) {
      console.error("AI WhatsApp reply failed", error);
      reply =
        "Mesa AI is temporarily unavailable. The shortcuts still work—send “help” to see them.";
    }
  }
  return respond(incomingSid, identity.family_id, identity.id, reply);
});
