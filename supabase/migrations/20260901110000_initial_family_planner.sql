create extension if not exists pgcrypto;

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our family',
  timezone text not null default 'Europe/Madrid',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'adult' check (role in ('owner', 'adult')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  kind text not null default 'adult' check (kind in ('adult', 'child')),
  color text not null default 'sage',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  description text not null default '',
  color text not null default 'sage',
  position integer not null default 0,
  archived_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_cards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  notes text not null default '',
  status text not null default 'open' check (status in ('open', 'assigned', 'done')),
  assignee_id uuid references public.people(id) on delete set null,
  due_at timestamptz,
  all_day boolean not null default true,
  show_on_calendar boolean not null default false,
  recurrence_rule text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  position integer not null default 0,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint list_cards_status_assignment_check check (
    (status = 'open' and assignee_id is null and completed_at is null)
    or (status = 'assigned' and assignee_id is not null and completed_at is null)
    or (status = 'done' and completed_at is not null)
  ),
  constraint list_cards_calendar_date_check check (not show_on_calendar or due_at is not null)
);

create table public.card_comments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  card_id uuid not null references public.list_cards(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  assignee_id uuid references public.people(id) on delete set null,
  source_type text not null default 'manual' check (source_type in ('manual', 'card', 'meal')),
  source_id text,
  recurrence_rule text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_time_check check (ends_at > starts_at),
  unique (family_id, source_type, source_id)
);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  week_start date not null,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  options jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, week_start)
);

create table public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  meal_date date not null,
  group_key text not null,
  recipe_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, meal_date, group_key)
);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'completed')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  ingredient_id text,
  name text not null,
  category text not null default 'other',
  required_quantity numeric not null default 1 check (required_quantity >= 0),
  unit text not null default 'unit',
  purchase_quantity numeric not null default 1 check (purchase_quantity >= 0),
  source text not null default 'manual' check (source in ('meal', 'staple', 'manual')),
  pantry boolean not null default false,
  removed boolean not null default false,
  purchased boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'whatsapp')),
  status text not null default 'pending' check (status in ('pending', 'active', 'error', 'disconnected')),
  external_account_label text,
  settings jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table private.integration_credentials (
  connection_id uuid primary key references public.integration_connections(id) on delete cascade,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.external_event_mappings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  connection_id uuid not null references public.integration_connections(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  external_calendar_id text not null,
  external_event_id text not null,
  external_etag text,
  sync_state text not null default 'synced' check (sync_state in ('synced', 'pending', 'conflict', 'deleted')),
  last_synced_at timestamptz,
  unique (connection_id, external_calendar_id, external_event_id),
  unique (connection_id, calendar_event_id)
);

create index family_members_user_idx on public.family_members(user_id);
create index people_family_idx on public.people(family_id);
create index lists_family_position_idx on public.lists(family_id, position);
create index list_cards_board_idx on public.list_cards(list_id, status, position);
create index list_cards_due_idx on public.list_cards(family_id, due_at) where due_at is not null;
create index calendar_events_range_idx on public.calendar_events(family_id, starts_at, ends_at);
create index meal_plans_family_week_idx on public.meal_plans(family_id, week_start);
create index shopping_lists_family_idx on public.shopping_lists(family_id, created_at desc);

create or replace function private.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_family_owner(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
      and fm.role = 'owner'
  );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace function private.handle_new_family()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.family_members (family_id, user_id, role)
  values (new.id, new.created_by, 'owner');

  insert into public.people (family_id, user_id, display_name, kind)
  select new.id, p.id, p.display_name, 'adult'
  from public.profiles p
  where p.id = new.created_by;

  insert into public.lists (family_id, name, description, color, position, created_by)
  values
    (new.id, 'Family tasks', 'Shared jobs, errands and reminders.', 'sage', 0, new.created_by),
    (new.id, 'Things to buy', 'Non-grocery shopping for the family.', 'amber', 1, new.created_by);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create trigger on_family_created
  after insert on public.families
  for each row execute procedure private.handle_new_family();

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure private.set_updated_at();
create trigger families_updated_at before update on public.families
  for each row execute procedure private.set_updated_at();
create trigger people_updated_at before update on public.people
  for each row execute procedure private.set_updated_at();
create trigger lists_updated_at before update on public.lists
  for each row execute procedure private.set_updated_at();
create trigger list_cards_updated_at before update on public.list_cards
  for each row execute procedure private.set_updated_at();
create trigger card_comments_updated_at before update on public.card_comments
  for each row execute procedure private.set_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute procedure private.set_updated_at();
create trigger meal_plans_updated_at before update on public.meal_plans
  for each row execute procedure private.set_updated_at();
create trigger planned_meals_updated_at before update on public.planned_meals
  for each row execute procedure private.set_updated_at();
create trigger shopping_lists_updated_at before update on public.shopping_lists
  for each row execute procedure private.set_updated_at();
create trigger shopping_items_updated_at before update on public.shopping_items
  for each row execute procedure private.set_updated_at();
create trigger integration_connections_updated_at before update on public.integration_connections
  for each row execute procedure private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.people enable row level security;
alter table public.lists enable row level security;
alter table public.list_cards enable row level security;
alter table public.card_comments enable row level security;
alter table public.calendar_events enable row level security;
alter table public.meal_plans enable row level security;
alter table public.planned_meals enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.integration_connections enable row level security;
alter table public.external_event_mappings enable row level security;

create policy "profiles_select_family" on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.family_members mine
    join public.family_members theirs on theirs.family_id = mine.family_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = profiles.id
  )
);
create policy "profiles_update_self" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "families_select_member" on public.families for select to authenticated
using ((select private.is_family_member(id)));
create policy "families_insert_authenticated" on public.families for insert to authenticated
with check (created_by = (select auth.uid()));
create policy "families_update_owner" on public.families for update to authenticated
using ((select private.is_family_owner(id))) with check ((select private.is_family_owner(id)));

create policy "family_members_select_member" on public.family_members for select to authenticated
using ((select private.is_family_member(family_id)));
create policy "family_members_insert_owner" on public.family_members for insert to authenticated
with check ((select private.is_family_owner(family_id)));
create policy "family_members_update_owner" on public.family_members for update to authenticated
using ((select private.is_family_owner(family_id))) with check ((select private.is_family_owner(family_id)));
create policy "family_members_delete_owner" on public.family_members for delete to authenticated
using ((select private.is_family_owner(family_id)) and user_id <> (select auth.uid()));

create policy "people_member_all" on public.people for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "lists_member_all" on public.lists for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "list_cards_member_all" on public.list_cards for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "card_comments_member_all" on public.card_comments for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "calendar_events_member_all" on public.calendar_events for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "meal_plans_member_all" on public.meal_plans for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "planned_meals_member_all" on public.planned_meals for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "shopping_lists_member_all" on public.shopping_lists for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "shopping_items_member_all" on public.shopping_items for all to authenticated
using ((select private.is_family_member(family_id)))
with check ((select private.is_family_member(family_id)));
create policy "integration_connections_own" on public.integration_connections for all to authenticated
using (user_id = (select auth.uid()) and (select private.is_family_member(family_id)))
with check (user_id = (select auth.uid()) and (select private.is_family_member(family_id)));
create policy "external_event_mappings_own_connection" on public.external_event_mappings for all to authenticated
using (
  exists (
    select 1 from public.integration_connections c
    where c.id = connection_id and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.integration_connections c
    where c.id = connection_id and c.user_id = (select auth.uid())
  )
);

grant usage on schema private to authenticated, service_role;
grant execute on function private.is_family_member(uuid) to authenticated, service_role;
grant execute on function private.is_family_owner(uuid) to authenticated, service_role;

alter publication supabase_realtime add table
  public.lists,
  public.list_cards,
  public.card_comments,
  public.calendar_events,
  public.meal_plans,
  public.planned_meals,
  public.shopping_lists,
  public.shopping_items;
