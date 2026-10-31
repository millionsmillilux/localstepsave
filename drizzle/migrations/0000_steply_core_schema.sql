-- Consolidated Steply schema (accounts, profiles, marketplace, applications, progress).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) $$;

-- Accounts
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','employer','admin')),
  display_name text,
  account_status text not null default 'active' check (account_status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.user_profiles to authenticated;
grant all on public.user_profiles to service_role;
alter table public.user_profiles enable row level security;
create policy "Users read own profile" on public.user_profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Admins update user profiles" on public.user_profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.student_profiles to authenticated;
grant all on public.student_profiles to service_role;
alter table public.student_profiles enable row level security;
create policy "Students manage their profile" on public.student_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.student_resumes (
  user_id uuid primary key,
  resume jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.student_resumes to authenticated;
grant all on public.student_resumes to service_role;
alter table public.student_resumes enable row level security;
create policy "Students manage their resume" on public.student_resumes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Create account rows once at signup; later logins never overwrite existing data.
create or replace function public.sync_user_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, role, display_name)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'employer' then 'employer' else 'student' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update set
    role = case when user_profiles.role = 'admin' then 'admin' else excluded.role end,
    display_name = coalesce(user_profiles.display_name, excluded.display_name),
    updated_at = now();
  if coalesce(new.raw_user_meta_data ->> 'role', 'student') <> 'employer' then
    insert into public.student_profiles (user_id) values (new.id) on conflict (user_id) do nothing;
  end if;
  return new;
end; $$;
create trigger on_auth_user_profile_created
after insert or update of raw_user_meta_data on auth.users
for each row execute function public.sync_user_profile();

-- Businesses
create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  location text not null default '',
  industry text, website text, contact_email text, phone text, logo_url text,
  social_links jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unsubmitted' check (verification_status in ('unsubmitted','pending','approved','rejected')),
  verification_submitted_at timestamptz, verification_reviewed_at timestamptz, verification_notes text,
  account_status text not null default 'active' check (account_status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.business_profiles to anon, authenticated;
grant insert, update on public.business_profiles to authenticated;
grant all on public.business_profiles to service_role;
alter table public.business_profiles enable row level security;
create policy "Public can read approved business profiles" on public.business_profiles for select to anon, authenticated using (verification_status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "Employers create their business profile" on public.business_profiles for insert to authenticated with check (owner_id = auth.uid() and verification_status = 'unsubmitted');
create policy "Employers update their unreviewed profile" on public.business_profiles for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and verification_status in ('unsubmitted','pending'));
create policy "Admins manage business profiles" on public.business_profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  submitted_by uuid not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz, reviewed_by uuid
);
grant insert, select, update on public.verification_submissions to authenticated;
grant all on public.verification_submissions to service_role;
alter table public.verification_submissions enable row level security;
create policy "Employers submit verification" on public.verification_submissions for insert to authenticated with check (submitted_by = auth.uid());
create policy "Employers read their submissions" on public.verification_submissions for select to authenticated using (submitted_by = auth.uid() or public.is_admin());
create policy "Admins review submissions" on public.verification_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_verification(profile_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  update public.business_profiles
    set verification_status = 'pending', verification_submitted_at = now(), verification_notes = null
    where id = profile_id and owner_id = auth.uid() and verification_status <> 'approved';
  if found then
    insert into public.verification_submissions (business_profile_id, submitted_by) values (profile_id, auth.uid());
  end if;
end; $$;
grant execute on function public.submit_verification(uuid) to authenticated;

-- Opportunities
create table public.opportunities (
  id text primary key,
  owner_id uuid not null,
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  title text not null,
  employer_name text not null,
  location text not null default '',
  summary text not null default '',
  description text not null default '',
  status text not null default 'pending_review' check (status in ('draft','pending_review','active','rejected','suspended','expired')),
  opportunity_type text not null default 'job',
  category text, employment_type text, schedule text,
  pay_min numeric, pay_max numeric, minimum_age integer, maximum_age integer,
  experience text,
  requires_resume boolean not null default false,
  application_questions jsonb not null default '[]'::jsonb,
  deadline date,
  required_skills text[] not null default '{}',
  tags text[] not null default '{}',
  openings integer not null default 1 check (openings > 0),
  contact_name text, contact_email text,
  contact_social_links jsonb not null default '{}'::jsonb,
  views_count bigint not null default 0,
  saves_count bigint not null default 0,
  posted_at timestamptz not null default now(),
  expires_at timestamptz, reviewed_at timestamptz, reviewed_by uuid, review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_status_idx on public.opportunities(status);
create index opportunities_owner_idx on public.opportunities(owner_id);
grant select on public.opportunities to anon, authenticated;
grant insert, update on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "Public can read active opportunities" on public.opportunities for select to anon, authenticated using (status = 'active' or owner_id = auth.uid() or public.is_admin());
create policy "Employers create own opportunity drafts" on public.opportunities for insert to authenticated
  with check (owner_id = auth.uid() and (status = 'draft' or (status = 'pending_review' and exists (
    select 1 from public.business_profiles p where p.owner_id = auth.uid() and p.verification_status = 'approved'))));
create policy "Employers update own opportunity drafts" on public.opportunities for update to authenticated
  using (owner_id = auth.uid() and status in ('draft','pending_review')) with check (owner_id = auth.uid() and status in ('draft','pending_review'));
create policy "Employers close or edit active opportunities" on public.opportunities for update to authenticated
  using (owner_id = auth.uid() and status in ('active','suspended')) with check (owner_id = auth.uid() and status in ('active','suspended'));
create policy "Admins manage opportunities" on public.opportunities for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.opportunity_metrics (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  actor_id uuid,
  metric text not null check (metric in ('view','save')),
  created_at timestamptz not null default now(),
  unique (opportunity_id, actor_id, metric)
);
grant select, insert on public.opportunity_metrics to authenticated;
grant all on public.opportunity_metrics to service_role;
alter table public.opportunity_metrics enable row level security;
create policy "Users record opportunity metrics" on public.opportunity_metrics for insert to authenticated with check (actor_id = auth.uid());
create policy "Owners read opportunity metrics" on public.opportunity_metrics for select to authenticated
  using (exists (select 1 from public.opportunities o where o.id = opportunity_id and o.owner_id = auth.uid()));

create or replace function public.record_opportunity_metric(p_opportunity_id text, p_metric text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_metric not in ('view','save') then raise exception 'Invalid metric'; end if;
  insert into public.opportunity_metrics(opportunity_id, actor_id, metric) values (p_opportunity_id, auth.uid(), p_metric) on conflict do nothing;
  if found then
    if p_metric = 'view' then update public.opportunities set views_count = views_count + 1 where id = p_opportunity_id;
    else update public.opportunities set saves_count = saves_count + 1 where id = p_opportunity_id; end if;
  end if;
end $$;
revoke execute on function public.record_opportunity_metric(text, text) from public, anon;
grant execute on function public.record_opportunity_metric(text, text) to authenticated;

create table public.saved_opportunities (
  user_id uuid not null,
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);
grant select, insert, delete on public.saved_opportunities to authenticated;
grant all on public.saved_opportunities to service_role;
alter table public.saved_opportunities enable row level security;
create policy "Students manage their saved opportunities" on public.saved_opportunities for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.opportunity_reports (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  reporter_id uuid,
  reason text not null check (reason in ('Suspicious/scam','Incorrect information','No longer available','Inappropriate')),
  details text,
  status text not null default 'open' check (status in ('open','resolved')),
  resolved_at timestamptz, resolved_by uuid,
  created_at timestamptz not null default now()
);
grant insert, select, update on public.opportunity_reports to authenticated;
grant all on public.opportunity_reports to service_role;
alter table public.opportunity_reports enable row level security;
create policy "Signed in users report opportunities" on public.opportunity_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "Admins read opportunity reports" on public.opportunity_reports for select to authenticated using (public.is_admin());
create policy "Admins update reports" on public.opportunity_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  opportunity_id text not null,
  employer_id uuid,
  submitted_at timestamptz not null default now(),
  status text not null default 'Submitted' check (status in ('Submitted','Viewed','Under Review','Interview','Offer','Accepted','Not Selected','Withdrawn')),
  message text not null default '',
  question_answers jsonb not null default '{}'::jsonb,
  profile_snapshot jsonb not null,
  match_score_at_submission integer not null default 0 check (match_score_at_submission between 0 and 100),
  viewed_at timestamptz, interview_date timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, opportunity_id)
);
create index applications_employer_idx on public.applications(employer_id);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Students can view their applications" on public.applications for select to authenticated using (student_id = auth.uid());
create policy "Students can submit applications" on public.applications for insert to authenticated with check (student_id = auth.uid());
create policy "Students can withdraw applications" on public.applications for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid() and status = 'Withdrawn');
create policy "Employers can view their applications" on public.applications for select to authenticated using (employer_id = auth.uid());
create policy "Employers can update their applications" on public.applications for update to authenticated using (employer_id = auth.uid()) with check (employer_id = auth.uid());
create policy "Admins read applications" on public.applications for select to authenticated using (public.is_admin());

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  label text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.application_events to authenticated;
grant all on public.application_events to service_role;
alter table public.application_events enable row level security;
create policy "Application participants can view events" on public.application_events for select to authenticated using (
  exists (select 1 from public.applications a where a.id = application_id and (a.student_id = auth.uid() or a.employer_id = auth.uid())));
create policy "Employers can add events" on public.application_events for insert to authenticated with check (
  exists (select 1 from public.applications a where a.id = application_id and a.employer_id = auth.uid()));

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  employer_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.application_notes to authenticated;
grant all on public.application_notes to service_role;
alter table public.application_notes enable row level security;
create policy "Employers manage their notes" on public.application_notes for all to authenticated using (employer_id = auth.uid()) with check (
  employer_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.employer_id = auth.uid()));

create or replace function public.prepare_application()
returns trigger language plpgsql security definer set search_path = public as $$
declare opportunity_owner uuid; opportunity_status text;
begin
  if new.student_id <> auth.uid() then raise exception 'Applications can only be submitted for the signed-in student'; end if;
  select owner_id, status into opportunity_owner, opportunity_status from public.opportunities where id = new.opportunity_id;
  if opportunity_owner is null or opportunity_status <> 'active' then raise exception 'This opportunity is not accepting applications'; end if;
  new.employer_id := opportunity_owner;
  return new;
end; $$;
create trigger prepare_application_before_insert before insert on public.applications for each row execute function public.prepare_application();

create or replace function public.protect_application_identity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.student_id <> old.student_id or new.opportunity_id <> old.opportunity_id
    or new.employer_id is distinct from old.employer_id or new.profile_snapshot is distinct from old.profile_snapshot
    or new.match_score_at_submission <> old.match_score_at_submission or new.submitted_at <> old.submitted_at then
    raise exception 'Application identity and submitted snapshot are immutable';
  end if;
  new.updated_at := now();
  return new;
end; $$;
create trigger applications_protect_identity before update on public.applications for each row execute function public.protect_application_identity();

-- Notifications & audit
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null, title text not null, body text not null default '',
  item_id text, read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
grant select, update, insert on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Users mark own notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins create notifications" on public.notifications for insert to authenticated with check (public.is_admin());

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null, item_type text not null, item_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant insert, select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;
create policy "Admins read audit log" on public.admin_audit_log for select to authenticated using (public.is_admin());
create policy "Admins create audit log" on public.admin_audit_log for insert to authenticated with check (admin_id = auth.uid() and public.is_admin());

create or replace function public.record_application_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_events (application_id, event_type, label)
    values (new.id, case when new.status = 'Viewed' then 'viewed' else 'status' end,
      case when new.status = 'Viewed' then 'Employer viewed your application' else 'Application moved to ' || new.status end);
    insert into public.notifications (user_id, type, title, body, item_id)
    values (new.student_id, 'application_status', 'Application status updated', 'Your application moved to ' || new.status || '.', new.id::text);
  end if;
  return new;
end; $$;
create trigger applications_record_status_change after update of status on public.applications for each row execute function public.record_application_status_change();

create or replace function public.employer_dashboard_counts()
returns table (active_jobs bigint, pending_jobs bigint, applicants bigint, interviews bigint, offers bigint)
language sql stable security invoker set search_path = public as $$
  select count(distinct o.id) filter (where o.status = 'active'), count(distinct o.id) filter (where o.status = 'pending_review'),
    count(a.id), count(a.id) filter (where a.status = 'Interview'), count(a.id) filter (where a.status = 'Offer')
  from public.opportunities o left join public.applications a on a.opportunity_id = o.id and a.employer_id = auth.uid()
  where o.owner_id = auth.uid();
$$;
grant execute on function public.employer_dashboard_counts() to authenticated;

-- Student progress
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  title text not null, description text not null default '',
  status text not null default 'todo', priority text not null default 'medium',
  due_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  title text not null, description text not null default '',
  category text not null default 'other', due_date date not null,
  opportunity_id text references public.opportunities(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  title text not null, organization text not null default '', role text not null default '',
  description text not null default '', category text not null default 'extracurricular',
  start_date date, end_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  title text not null, organization text not null default '',
  description text not null default '', achieved_at date, credential_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks, public.deadlines, public.activities, public.achievements to authenticated;
grant all on public.tasks, public.deadlines, public.activities, public.achievements to service_role;
alter table public.tasks enable row level security;
alter table public.deadlines enable row level security;
alter table public.activities enable row level security;
alter table public.achievements enable row level security;
create policy "Students manage their tasks" on public.tasks for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Students manage their deadlines" on public.deadlines for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Students manage their activities" on public.activities for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Students manage their achievements" on public.achievements for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Backfill account rows for anyone who signed up before this schema existed.
insert into public.user_profiles (id, role, display_name)
select u.id, case when u.raw_user_meta_data ->> 'role' = 'employer' then 'employer' else 'student' end,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u on conflict (id) do nothing;
insert into public.student_profiles (user_id)
select u.id from auth.users u where coalesce(u.raw_user_meta_data ->> 'role','student') <> 'employer'
on conflict (user_id) do nothing;