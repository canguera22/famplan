create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table public.whatsapp_digest_deliveries (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.whatsapp_identities(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  digest_date date not null,
  status text not null check (status in ('pending', 'sent', 'skipped', 'failed')),
  message_sid text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identity_id, digest_date)
);

create index whatsapp_digest_deliveries_family_date_idx
  on public.whatsapp_digest_deliveries (family_id, digest_date desc);

create trigger whatsapp_digest_deliveries_updated_at
before update on public.whatsapp_digest_deliveries
for each row execute procedure private.set_updated_at();

alter table public.whatsapp_digest_deliveries enable row level security;

create policy "whatsapp_digest_deliveries_family_select"
on public.whatsapp_digest_deliveries for select to authenticated
using ((select private.is_family_member(family_id)));

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'mesa_project_url') then
    perform vault.create_secret('https://weewevwhgxfhlvwwnzqj.supabase.co', 'mesa_project_url');
  end if;
  if not exists (select 1 from vault.secrets where name = 'mesa_publishable_key') then
    perform vault.create_secret(
      'sb_publishable_VjuunlynI2m5x0KTtvmTAQ_d-DoNEPQ',
      'mesa_publishable_key'
    );
  end if;
end
$$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'mesa-morning-whatsapp-digest';

select cron.schedule(
  'mesa-morning-whatsapp-digest',
  '0 7,8 * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'mesa_project_url')
        || '/functions/v1/morning-digest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'mesa_publishable_key')
      ),
      body := jsonb_build_object('scheduled_at', now()),
      timeout_milliseconds := 10000
    ) as request_id;
  $job$
);
