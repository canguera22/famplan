create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email text not null check (length(trim(email)) > 3),
  role text not null default 'adult' check (role = 'adult'),
  token uuid not null default gen_random_uuid() unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index family_invitations_pending_email_idx
  on public.family_invitations (family_id, lower(email))
  where status = 'pending';
create index family_invitations_family_idx
  on public.family_invitations (family_id, created_at desc);

create trigger family_invitations_updated_at before update on public.family_invitations
  for each row execute procedure private.set_updated_at();

alter table public.family_invitations enable row level security;

create policy "family_invitations_owner_select" on public.family_invitations
  for select to authenticated
  using ((select private.is_family_owner(family_id)));

create policy "family_invitations_owner_insert" on public.family_invitations
  for insert to authenticated
  with check (
    invited_by = (select auth.uid())
    and (select private.is_family_owner(family_id))
  );

create policy "family_invitations_owner_update" on public.family_invitations
  for update to authenticated
  using ((select private.is_family_owner(family_id)))
  with check ((select private.is_family_owner(family_id)));

create or replace function public.accept_family_invitation(invitation_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.family_invitations%rowtype;
  account_email text;
  account_name text;
  existing_family_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'You must sign in before accepting an invitation.';
  end if;

  select * into invitation
  from public.family_invitations
  where token = invitation_token
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    raise exception 'This invitation is invalid, expired, or has already been used.';
  end if;

  select lower(email) into account_email
  from auth.users
  where id = (select auth.uid());

  if account_email is null or account_email <> lower(invitation.email) then
    raise exception 'Sign in with the email address that received this invitation.';
  end if;

  select family_id into existing_family_id
  from public.family_members
  where user_id = (select auth.uid())
  limit 1;

  if existing_family_id is not null and existing_family_id <> invitation.family_id then
    raise exception 'This account already belongs to another family space.';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (invitation.family_id, (select auth.uid()), invitation.role)
  on conflict (family_id, user_id) do nothing;

  select display_name into account_name
  from public.profiles
  where id = (select auth.uid());

  insert into public.people (family_id, user_id, display_name, kind, color)
  values (
    invitation.family_id,
    (select auth.uid()),
    coalesce(nullif(account_name, ''), split_part(invitation.email, '@', 1)),
    'adult',
    'green'
  )
  on conflict (family_id, user_id) do update
    set active = true,
        updated_at = now();

  update public.family_invitations
  set status = 'accepted',
      accepted_by = (select auth.uid()),
      accepted_at = now()
  where id = invitation.id;

  return invitation.family_id;
end;
$$;

revoke all on function public.accept_family_invitation(uuid) from public;
grant execute on function public.accept_family_invitation(uuid) to authenticated;
