import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "";
const TWILIO_CONTENT_SID = Deno.env.get("TWILIO_CONTENT_SID") ?? "";
const TIME_ZONE = "Europe/Madrid";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function madridParts(value = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(value)
      .map((part) => [part.type, part.value]),
  );
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

function addDays(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + amount)).toISOString().slice(0, 10);
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

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function sendTwilioMessage(options: {
  to: string;
  name: string;
  digest: string;
  canUseFreeform: boolean;
}) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error("Twilio outbound secrets are incomplete.");
  }
  const parameters = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: options.to,
  });
  if (options.canUseFreeform) {
    parameters.set(
      "Body",
      `Good morning ${options.name}! Here’s your Mesa plan:\n\n${options.digest}`,
    );
  } else {
    if (!TWILIO_CONTENT_SID) {
      throw new Error("TWILIO_CONTENT_SID is required outside the 24-hour WhatsApp window.");
    }
    parameters.set("ContentSid", TWILIO_CONTENT_SID);
    parameters.set("ContentVariables", JSON.stringify({ 1: options.name, 2: options.digest }));
  }
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: parameters,
    },
  );
  const result = (await response.json()) as { sid?: string; message?: string };
  if (!response.ok || !result.sid)
    throw new Error(result.message || `Twilio error ${response.status}`);
  return result.sid;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Not found", { status: 404 });
  const { dateKey, hour } = madridParts();
  if (hour !== 9) {
    return Response.json({ skipped: true, reason: "outside_morning_window", date: dateKey });
  }

  const { data: identities, error: identitiesError } = await supabase
    .from("whatsapp_identities")
    .select("id, family_id, person_id, whatsapp_address")
    .eq("active", true);
  if (identitiesError) return Response.json({ error: identitiesError.message }, { status: 500 });

  const results: Array<Record<string, unknown>> = [];
  for (const identity of identities ?? []) {
    const { data: prior } = await supabase
      .from("whatsapp_digest_deliveries")
      .select("status")
      .eq("identity_id", identity.id)
      .eq("digest_date", dateKey)
      .maybeSingle();
    if (prior?.status === "sent" || prior?.status === "skipped") {
      results.push({ identityId: identity.id, status: "already_processed" });
      continue;
    }

    const endOfToday = zonedDateAt(addDays(dateKey, 1), 0);
    const [{ data: tasks }, { data: latestInbound }, { data: person }] = await Promise.all([
      supabase
        .from("list_cards")
        .select("title, due_at")
        .eq("family_id", identity.family_id)
        .eq("assignee_id", identity.person_id)
        .neq("status", "done")
        .not("due_at", "is", null)
        .lt("due_at", endOfToday)
        .order("due_at"),
      supabase
        .from("whatsapp_messages")
        .select("created_at")
        .eq("identity_id", identity.id)
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("people").select("display_name").eq("id", identity.person_id).single(),
    ]);

    const dueToday = (tasks ?? []).filter(
      (task) => task.due_at && madridParts(new Date(task.due_at)).dateKey === dateKey,
    );
    const overdue = (tasks ?? []).filter(
      (task) => task.due_at && madridParts(new Date(task.due_at)).dateKey < dateKey,
    );
    if (!dueToday.length && !overdue.length) {
      await supabase.from("whatsapp_digest_deliveries").upsert(
        {
          identity_id: identity.id,
          family_id: identity.family_id,
          digest_date: dateKey,
          status: "skipped",
        },
        { onConflict: "identity_id,digest_date" },
      );
      results.push({ identityId: identity.id, status: "clear" });
      continue;
    }

    const lines: string[] = [];
    if (dueToday.length) {
      lines.push("Due today:", ...dueToday.map((task) => `• ${task.title}`));
    }
    if (overdue.length) {
      if (lines.length) lines.push("");
      lines.push(
        "Past due:",
        ...overdue.map((task) => `• ${task.title} (${displayDate(task.due_at!)})`),
      );
    }
    const digest = lines.join("\n");
    const name = person?.display_name?.split(" ")[0] || "there";
    const canUseFreeform = latestInbound?.created_at
      ? Date.now() - new Date(latestInbound.created_at).getTime() < 23 * 60 * 60 * 1000
      : false;

    await supabase.from("whatsapp_digest_deliveries").upsert(
      {
        identity_id: identity.id,
        family_id: identity.family_id,
        digest_date: dateKey,
        status: "pending",
        error: null,
      },
      { onConflict: "identity_id,digest_date" },
    );
    try {
      const messageSid = await sendTwilioMessage({
        to: identity.whatsapp_address,
        name,
        digest,
        canUseFreeform,
      });
      await Promise.all([
        supabase
          .from("whatsapp_digest_deliveries")
          .update({ status: "sent", message_sid: messageSid, sent_at: new Date().toISOString() })
          .eq("identity_id", identity.id)
          .eq("digest_date", dateKey),
        supabase.from("whatsapp_messages").upsert({
          message_sid: messageSid,
          family_id: identity.family_id,
          identity_id: identity.id,
          direction: "outbound",
          body: digest,
          status: "sent",
          metadata: { kind: "morning_digest", digest_date: dateKey },
        }),
      ]);
      results.push({ identityId: identity.id, status: "sent" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown delivery error";
      await supabase
        .from("whatsapp_digest_deliveries")
        .update({ status: "failed", error: message })
        .eq("identity_id", identity.id)
        .eq("digest_date", dateKey);
      results.push({ identityId: identity.id, status: "failed", error: message });
    }
  }

  return Response.json({ date: dateKey, results });
});
