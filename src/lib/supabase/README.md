# Supabase boundary

`client.ts` is browser-only and uses the public publishable key. Never import a
Supabase secret key into code reachable from the browser.

Server integrations (Google Calendar and WhatsApp) will use dedicated server
functions or Supabase Edge Functions. Their tokens live in the private database
schema and are never returned through the public Data API.

After applying migrations, generate the database types with:

```sh
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```
