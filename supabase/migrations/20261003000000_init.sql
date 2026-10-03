-- ClauseCheck initial schema (spec §8). Embedding dims = 768 (gemini-embedding-001, see docs/PLAN.md).

-- Extensions
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Enums
create type public.org_role as enum ('owner','attorney','reviewer','viewer');
create type public.contract_type as enum ('nda_mutual','nda_one_way','msa','saas','other');
create type public.our_side as enum ('mutual','discloser','recipient','customer','vendor');
create type public.contract_status as enum ('uploaded','parsing','extracting','embedding','scoring','ready','failed');
create type public.position as enum ('preferred','fallback','unacceptable','not_covered');
create type public.risk as enum ('low','medium','high');
create type public.redline_status as enum ('none','proposed','accepted','edited','rejected');
create type public.task_status as enum ('open','in_progress','resolved');

-- Tenancy
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_demo_sandbox boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'reviewer',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index on public.memberships (user_id);

-- RLS helpers (security definer so policies don't recurse on memberships)
create or replace function public.is_member(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships m
                 where m.org_id = p_org and m.user_id = (select auth.uid()));
$$;

create or replace function public.has_role(p_org uuid, p_roles public.org_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships m
                 where m.org_id = p_org and m.user_id = (select auth.uid())
                   and m.role = any(p_roles));
$$;

-- Playbooks
create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contract_type public.contract_type not null,
  our_side public.our_side not null,
  is_default boolean not null default false,
  version int not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index playbooks_one_default on public.playbooks (org_id, contract_type, our_side) where is_default;

create table public.playbook_rules (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.playbooks(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  clause_type text not null,
  required boolean not null default false,
  preferred text not null,
  fallback text,
  unacceptable text,
  guidance text,
  sample_language text,
  severity public.risk not null default 'medium',
  sort_order int not null default 0,
  unique (playbook_id, clause_type)
);

-- Contracts
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  counterparty text,
  contract_type public.contract_type,
  our_side public.our_side,
  playbook_id uuid references public.playbooks(id) on delete set null,
  storage_path text not null,           -- {org_id}/{contract_id}/{filename}
  mime_type text not null check (mime_type in ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  page_count int,
  pages_are_estimated boolean not null default false,  -- true for DOCX
  status public.contract_status not null default 'uploaded',
  error text,
  signed_off_by uuid references auth.users(id),
  signed_off_at timestamptz,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.contracts (org_id, created_at desc);

create table public.contract_pages (
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  page_number int not null,
  text text not null,
  char_start int not null,              -- offset into the full normalised text
  char_end int not null,
  primary key (contract_id, page_number)
);

create table public.clauses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  clause_type text not null,
  heading text,
  section_ref text,                     -- e.g. "11.2"
  text text not null,
  page_start int not null,
  page_end int not null,
  char_start int not null,
  char_end int not null,
  confidence real not null check (confidence between 0 and 1),
  key_terms jsonb not null default '{}', -- e.g. {"cap_months":1,"governing_law":"Delaware"}
  created_at timestamptz not null default now()
);
create index on public.clauses (contract_id, clause_type);

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  clause_id uuid references public.clauses(id) on delete cascade,
  section_ref text,
  page_start int not null,
  page_end int not null,
  text text not null,
  token_count int not null,
  embedding extensions.vector(768) not null,
  fts tsvector generated always as (to_tsvector('english', coalesce(section_ref,'') || ' ' || text)) stored
);
create index chunks_embedding_hnsw on public.chunks using hnsw (embedding extensions.vector_cosine_ops);
create index chunks_fts on public.chunks using gin (fts);
create index on public.chunks (contract_id);

create table public.clause_assessments (
  id uuid primary key default gen_random_uuid(),
  clause_id uuid not null references public.clauses(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  rule_id uuid references public.playbook_rules(id) on delete set null,
  playbook_version int not null,
  position public.position not null,
  risk public.risk not null,
  rationale text not null,
  quoted_text text not null,            -- verbatim span the rationale relies on
  suggested_redline text,
  redline_status public.redline_status not null default 'none',
  edited_redline text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (clause_id, playbook_version)
);

create table public.missing_clauses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  rule_id uuid references public.playbook_rules(id) on delete set null,
  clause_type text not null,
  severity public.risk not null,
  recommendation text not null,
  suggested_language text
);

create table public.qa_messages (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  question text not null,
  answer text not null,
  segments jsonb not null,               -- [{text, citations:[{chunk_id,clause_id,section_ref,page_start,page_end,cited_text}]}]
  abstained boolean not null default false,
  escalated boolean not null default false,
  feedback smallint check (feedback in (-1,1)),
  latency_ms int,
  created_at timestamptz not null default now()
);

create table public.review_tasks (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  source text not null check (source in ('qa','assessment','manual','low_confidence')),
  source_id uuid,
  reason text not null,
  assigned_to uuid references auth.users(id),
  status public.task_status not null default 'open',
  resolution_note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.exports (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  format text not null check (format in ('docx','pdf')),
  storage_path text not null,
  is_draft boolean not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Observability (no contract text stored here)
create table public.llm_calls (
  id bigint generated always as identity primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  purpose text not null check (purpose in ('extract','score','redline','qa','judge','embed')),
  model text not null,
  input_tokens int, output_tokens int, cache_read_tokens int, cache_write_tokens int,
  cost_usd numeric(10,5),
  latency_ms int,
  stop_reason text,
  error text,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor uuid references auth.users(id),
  action text not null,                  -- e.g. 'contract.upload','redline.accept','review.signoff','playbook.update','export.create'
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Eval runs are global (synthetic data only) and publicly readable for the portfolio page
create table public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  git_sha text,
  model text not null,
  embedding_model text not null,
  split text not null check (split in ('dev','test')),
  dataset_version text not null,
  metrics jsonb not null,               -- see §11.3
  per_item jsonb not null,              -- failures list for drill-down
  cost_usd numeric(10,4),
  duration_s int
);

-- Hybrid retrieval (security invoker: RLS applies to the caller)
create or replace function public.match_chunks(
  p_contract_id uuid, p_query_embedding extensions.vector(768), p_query_text text,
  p_k int default 8, p_rrf_k int default 60)
returns table (id uuid, clause_id uuid, section_ref text, page_start int, page_end int, text text, score float)
language sql stable security invoker set search_path = '' as $$
  with v as (
    select c.id, row_number() over (order by c.embedding operator(extensions.<=>) p_query_embedding) as r
    from public.chunks c where c.contract_id = p_contract_id
    order by c.embedding operator(extensions.<=>) p_query_embedding limit 30),
  f as (
    select c.id, row_number() over (order by ts_rank_cd(c.fts, q) desc) as r
    from public.chunks c, websearch_to_tsquery('english', p_query_text) q
    where c.contract_id = p_contract_id and c.fts @@ q
    order by ts_rank_cd(c.fts, q) desc limit 30),
  fused as (
    select coalesce(v.id, f.id) as id,
           coalesce(1.0/(p_rrf_k + v.r), 0) + coalesce(1.0/(p_rrf_k + f.r), 0) as score
    from v full outer join f on v.id = f.id)
  select c.id, c.clause_id, c.section_ref, c.page_start, c.page_end, c.text, fused.score
  from fused join public.chunks c on c.id = fused.id
  order by fused.score desc limit p_k;
$$;

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger contracts_touch before update on public.contracts for each row execute function public.touch_updated_at();
create trigger playbooks_touch before update on public.playbooks for each row execute function public.touch_updated_at();

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.playbooks enable row level security;
alter table public.playbook_rules enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_pages enable row level security;
alter table public.clauses enable row level security;
alter table public.chunks enable row level security;
alter table public.clause_assessments enable row level security;
alter table public.missing_clauses enable row level security;
alter table public.qa_messages enable row level security;
alter table public.review_tasks enable row level security;
alter table public.exports enable row level security;
alter table public.llm_calls enable row level security;
alter table public.audit_log enable row level security;
alter table public.eval_runs enable row level security;

create policy org_select on public.organizations for select to authenticated using (public.is_member(id));
create policy org_update on public.organizations for update to authenticated using (public.has_role(id, '{owner}'));
-- org creation happens via service role in /api/orgs and /api/demo/start

create policy profile_self on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy mem_select on public.memberships for select to authenticated using (public.is_member(org_id));
create policy mem_owner_write on public.memberships for all to authenticated
  using (public.has_role(org_id, '{owner}')) with check (public.has_role(org_id, '{owner}'));

-- Generic pattern: members read; write by role
create policy pb_select on public.playbooks for select to authenticated using (public.is_member(org_id));
create policy pb_write on public.playbooks for all to authenticated
  using (public.has_role(org_id, '{owner,attorney}')) with check (public.has_role(org_id, '{owner,attorney}'));
create policy pbr_select on public.playbook_rules for select to authenticated using (public.is_member(org_id));
create policy pbr_write on public.playbook_rules for all to authenticated
  using (public.has_role(org_id, '{owner,attorney}')) with check (public.has_role(org_id, '{owner,attorney}'));

create policy c_select on public.contracts for select to authenticated using (public.is_member(org_id));
create policy c_insert on public.contracts for insert to authenticated
  with check (public.has_role(org_id, '{owner,attorney,reviewer}') and uploaded_by = (select auth.uid()));
create policy c_update on public.contracts for update to authenticated
  using (public.has_role(org_id, '{owner,attorney,reviewer}'));
create policy c_delete on public.contracts for delete to authenticated using (public.has_role(org_id, '{owner}'));

-- Pipeline tables: read by members; written by server with the user's session (role check) or service role
create policy cp_select on public.contract_pages for select to authenticated using (public.is_member(org_id));
create policy cl_select on public.clauses for select to authenticated using (public.is_member(org_id));
create policy ch_select on public.chunks for select to authenticated using (public.is_member(org_id));
create policy mc_select on public.missing_clauses for select to authenticated using (public.is_member(org_id));
create policy ca_select on public.clause_assessments for select to authenticated using (public.is_member(org_id));
create policy ca_update on public.clause_assessments for update to authenticated
  using (public.has_role(org_id, '{owner,attorney,reviewer}'));
-- Only attorneys/owners may set redline_status='accepted' (enforced in trigger below)

create policy qa_select on public.qa_messages for select to authenticated using (public.is_member(org_id));
create policy qa_insert on public.qa_messages for insert to authenticated
  with check (public.is_member(org_id) and user_id = (select auth.uid()));
create policy qa_feedback on public.qa_messages for update to authenticated
  using (user_id = (select auth.uid()));

create policy rt_select on public.review_tasks for select to authenticated using (public.is_member(org_id));
create policy rt_insert on public.review_tasks for insert to authenticated
  with check (public.has_role(org_id, '{owner,attorney,reviewer}'));
create policy rt_update on public.review_tasks for update to authenticated
  using (public.has_role(org_id, '{owner,attorney}'));

create policy ex_select on public.exports for select to authenticated using (public.is_member(org_id));
create policy al_select on public.audit_log for select to authenticated using (public.has_role(org_id, '{owner,attorney}'));
create policy llm_select on public.llm_calls for select to authenticated using (public.has_role(org_id, '{owner}'));
create policy eval_public_read on public.eval_runs for select to anon, authenticated using (true);
-- inserts into contract_pages/clauses/chunks/missing_clauses/assessments/exports/audit_log/llm_calls/eval_runs: service role only (no insert policy)

create or replace function public.guard_redline_accept() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.redline_status in ('accepted','edited') and old.redline_status is distinct from new.redline_status
     and not public.has_role(new.org_id, '{owner,attorney}') and (select auth.role()) <> 'service_role' then
    raise exception 'Only attorneys can accept redlines';
  end if;
  return new;
end $$;
create trigger ca_guard before update on public.clause_assessments for each row execute function public.guard_redline_accept();

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('contracts','contracts', false, 10485760, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('exports','exports', false, 20971520, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

create policy contracts_read on storage.objects for select to authenticated
  using (bucket_id in ('contracts','exports') and public.is_member(((storage.foldername(name))[1])::uuid));
create policy contracts_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'contracts'
    and public.has_role(((storage.foldername(name))[1])::uuid, '{owner,attorney,reviewer}'));

-- Realtime for status updates
alter publication supabase_realtime add table public.contracts;
