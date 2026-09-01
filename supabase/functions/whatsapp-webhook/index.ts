import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WEBHOOK_URL = Deno.env.get("TWILIO_WEBHOOK_URL") ?? "";
const TIME_ZONE = "Europe/Madrid";

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

function zonedDateAt(dateKey: string, hour: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const desired = Date.UTC(year!, month! - 1, day!, hour);
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
  const now = new Date();
  const today = madridDateKey(now);
  const lower = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const upper = new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString();
  const [eventsResult, tasksResult] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("title, starts_at, all_day")
      .eq("family_id", identity.family_id)
      .gte("starts_at", lower)
      .lte("starts_at", upper)
      .order("starts_at"),
    supabase
      .from("list_cards")
      .select("title, due_at, status")
      .eq("family_id", identity.family_id)
      .neq("status", "done")
      .not("due_at", "is", null)
      .gte("due_at", lower)
      .lte("due_at", upper)
      .order("due_at"),
  ]);
  const events = (eventsResult.data ?? []).filter(
    (event) => madridDateKey(event.starts_at) === today,
  );
  const tasks = (tasksResult.data ?? []).filter(
    (task) => task.due_at && madridDateKey(task.due_at) === today,
  );
  if (!events.length && !tasks.length) return "Today is clear—nothing scheduled and no tasks due.";

  const lines = ["Today in Mesa:"];
  for (const event of events) {
    lines.push(`• ${event.all_day ? "All day" : madridTime(event.starts_at)} — ${event.title}`);
  }
  for (const task of tasks) lines.push(`• Task — ${task.title}`);
  return lines.join("\n");
}

async function addTask(identity: Record<string, string>, rawTitle: string): Promise<string> {
  const nowKey = madridDateKey(new Date());
  const wantsTomorrow = /\btomorrow\b/i.test(rawTitle);
  const wantsToday = /\btoday\b/i.test(rawTitle);
  const dueKey = wantsTomorrow ? addDays(nowKey, 1) : wantsToday ? nowKey : null;
  const title = rawTitle
    .replace(/\b(today|tomorrow)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!title) return "Tell me what to add—for example: add Buy milk tomorrow";

  const [{ data: list }, { data: person }, { data: family }] = await Promise.all([
    supabase
      .from("lists")
      .select("id")
      .eq("family_id", identity.family_id)
      .order("position")
      .limit(1)
      .single(),
    supabase.from("people").select("user_id").eq("id", identity.person_id).single(),
    supabase.from("families").select("created_by").eq("id", identity.family_id).single(),
  ]);
  if (!list || !family) return "Mesa could not find your family task board.";
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
  return `Added “${title}” and assigned it to you${dueKey ? ` for ${wantsTomorrow ? "tomorrow" : "today"}` : ""}. Ref ${card.id.slice(0, 8)}.`;
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
      "Mesa commands:",
      "• today",
      "• add Buy milk",
      "• add Sign school form tomorrow",
      "• done Buy milk",
      "• help",
    ].join("\n");
  } else if (normalized === "today") {
    reply = await todaySummary(identity);
  } else if (/^add\s+/i.test(body)) {
    reply = await addTask(identity, body.replace(/^add\s+/i, ""));
  } else if (/^done\s+/i.test(body)) {
    reply = await completeTask(identity, body.replace(/^done\s+/i, ""));
  } else {
    reply = "I didn’t understand that yet. Send “help” to see the commands I know.";
  }
  return respond(incomingSid, identity.family_id, identity.id, reply);
});
