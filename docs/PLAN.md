# ClauseCheck: Execution Plan

> Companion to [`spec.md`](./spec.md). The spec says **what** to build. This file says **in what order**, **what changes from the spec** and **what makes it feel finished rather than MVP**.

## 1. Stack decision

**Next.js 16 (App Router) + React 19 + TypeScript + Supabase.** No React Native.

- Upwork buyers open a link in a desktop browser. A web app is the demo surface, and a mobile app adds store friction without helping the pitch.
- Next.js gives us server route handlers (Claude, Voyage and the service-role key stay server-side), SSR for the public `/` and `/evals` pages (SEO, OG images) and one-click Vercel deploy.
- Supabase covers Postgres + pgvector + RLS, Auth (magic link + anonymous), Storage, Realtime and Cron-friendly SQL.

UI: Tailwind 4 + shadcn/ui + lucide + `motion` (for micro-interactions) + `cmdk` (command palette) + sonner.

### LLM provider decision (2026-10-04)

**Default: Google Gemini API free tier** for both generation and embeddings (one key, no card). Claude stays available behind `LLM_PROVIDER=anthropic` for paid client builds.

| Spec assumption | Gemini build |
|---|---|
| `claude-opus-5-5` for extract / score / redline / Q&A | `gemini-2.5-flash` (env `LLM_MODEL`; verify the IDs your key lists) |
| Claude structured outputs | Gemini `responseMimeType: application/json` + `responseJsonSchema`, then zod |
| Claude native citations on document blocks | Provider-neutral citations: the model returns `segments[{text, citations[{chunk_id, quote}]}]` as JSON; code verifies each quote is a substring of its chunk and drops anything unverified. Streaming becomes "stream segments as they complete" |
| Voyage `voyage-law-2`, `vector(1024)` | `gemini-embedding-001` with `outputDimensionality: 768`, so the migration uses `vector(768)` |
| Prompt caching extract → score | Not relied on. Free-tier cost is $0 |
| `server-side-fallback` beta, refusal stop reason | Map Gemini `finishReason` (SAFETY, RECITATION, MAX_TOKENS) to the same handling: retry, split, or review task |
| Cost log in USD | Logged at $0 on the free tier, with token counts kept, so paid-tier cost can be computed |

Constraints: free tier is roughly 5-15 requests/min and 100-1,000/day per model (cut in April 2026), so the client retries 429s with backoff, the eval runner defaults to concurrency 1, and replay mode keeps live demos independent of quota. Free-tier prompts may be used by Google, which is acceptable only because all data is synthetic; the README says so.

## 2. Build order (vertical slice first)

The spec's phase order builds the pipeline before the UI. To get a demo-able, polished product as early as possible, this plan builds the **demo path end to end against seeded data first**, then makes it live.

| # | Milestone | Outcome | Spec refs |
|---|---|---|---|
| M0 | Repo + tooling | Next.js scaffold, lint/format/typecheck, CI, design tokens, fonts, shadcn, CLAUDE.md, Supabase linked, migration applied | §7, §8, §15 |
| M1 | Auth, tenancy, shell | Magic link, "Try the demo" anon sandbox, org switcher, sidebar shell, landing page v1 | Phase 1 |
| M2 | **Seeded demo data** | Hand-authored fixtures for the 3 demo contracts (pages, clauses, assessments, missing, chunks) + the 3 playbooks. The review UI can now be built with no LLM calls | §12 |
| M3 | **Review screen (polish focus)** | 3-pane review, PDF viewer + highlight, clause drawer, risk summary, missing card, injection banner, keyboard nav | Phase 5 (UI part) |
| M4 | Live pipeline | Upload → parse → segment → extract → embed → score, Realtime step tracker, central Claude client + cost log | Phases 2-4 |
| M5 | Redlines + escalation + sign-off | Diff UI, attorney-only accept (UI + trigger), tasks page, sign-off gate | Phase 5 (logic part) |
| M6 | Cited Q&A | Hybrid retrieval, streaming SSE, citation chips → PDF jump, abstention card | Phase 6 |
| M7 | Playbook editor + re-score | Rule editor, versioning, re-score with rationale diff | Phase 4 (UI part) |
| M8 | Memo export | DOCX + PDF from a single MemoModel, preview page | Phase 7 |
| M9 | Eval harness + `/evals` | Generator, runner, metrics, public page | Phase 8 |
| M10 | Hardening + deploy | Rate limits, spend guard, cron reset, admin page, tests, Vercel deploy, seed real pipeline output | Phase 9 |
| M11 | Portfolio assets | Screenshots, thumbnail, GIF, README, Upwork copy with real eval numbers | §18-19 |

M2 and M3 mean we have a clickable, good-looking product within the first few sessions, even before any API key is in place.

## 3. "Never feels like an MVP" polish list

These items go beyond the spec. Each one is small, but together they decide whether the product feels finished.

**First impression**
- Landing page with a real product screenshot hero, eval stat strip, and a "Try the demo, no sign-up" primary CTA. OG image + favicon + `<title>` per route.
- Guided first-run tour in the sandbox (3-4 coach marks: risk summary → clause → redline → ask). It can be dismissed and re-opened from the help menu.
- The sandbox opens on the SaaS contract review directly, not on an empty list.

**Interaction quality**
- Skeletons that match the final layout (no spinners on page loads). Optimistic updates for redline accept/reject and feedback.
- The processing tracker animates step by step, with elapsed time and a "what's happening" line per step.
- Keyboard: `j/k` move between clauses, `Enter` opens the drawer, `/` focuses Ask, `⌘K` opens the command palette (jump to contract, clause type, playbook).
- Citation chip click: smooth scroll + brass highlight pulse on the PDF text.
- Streaming answers with a typing cursor, plus copy-answer-with-citations.
- Every destructive or role-blocked action gets a tooltip explaining why ("Only attorneys can accept redlines").

**Visual system**
- Tokens from spec §13 (ink navy / parchment / brass, risk colours with icon + label), Source Serif 4 + Inter, dark mode, 8px grid.
- Consistent empty / error / loading states for every component (the spec lists them; we treat them as acceptance criteria).
- Responsive: the 3-pane review collapses to tabs (Clauses · Document · Ask) under 1024px, so it's usable on a tablet and presentable on a phone.

**Trust signals (matter for legal buyers)**
- Persistent but quiet "Demo · synthetic data" badge and "Not legal advice" footer.
- Audit trail visible per contract (timeline in a drawer).
- Cost and latency shown per review in admin, which signals production thinking.

**Reliability for live demos**
- `LLM_MODE=replay`: serves recorded model responses for the demo contracts, so a live demo never depends on API latency or quota. `live` is the default for uploads.
- Global spend guard plus a friendly "Demo budget reached" state instead of errors.
- Custom 404/500 pages and an error boundary per pane.

## 4. Changes and clarifications to the spec

| Spec item | Change | Why |
|---|---|---|
| Phase order | Vertical slice (M2/M3 before the pipeline) | Demo-able early; UI isn't blocked on prompt tuning |
| PDF highlight "by char offsets" | Highlight by locating the clause's verbatim text in the pdf.js text layer of its page (normalised fuzzy match), with char offsets as a fallback | pdf.js text-layer spans don't map 1:1 to our normalised offsets |
| Local dev on `supabase start` | Use a hosted Supabase dev project (Docker isn't installed on this machine). Integration tests run against a separate Supabase "test" project or a branch | No Docker locally |
| Anthropic API specifics (`server-side-fallback-2026-07-01` beta, `output_config.effort`, citations + structured outputs) | Verify every param against the installed `@anthropic-ai/sdk` types and current docs before coding the client | Beta names and shapes change; the spec flags this too |
| Eval set size (30 contracts, ~150 hand-checked clause variants) | Keep the size, but generate the variants with Claude and give you a review UI/checklist to approve them in batches | The hand-check is the biggest human time cost in the project |
| Vercel Hobby `maxDuration 300` | OK with Fluid Compute. If processing times out, split into step-per-request driven by status | Hobby limits |

## 5. Risks

1. **Clause extraction quality on the 14-page demo contract.** Mitigation: tune on the dev split; seeded demo results come from a real run, reviewed by hand.
2. **PDF highlight precision.** Mitigation: see §4; e2e test that the highlight lands on the expected page.
3. **Free-tier limits** (Supabase pausing, Vercel duration). Mitigation: daily cron hits the DB; replay mode.
4. **Cost leakage from anonymous visitors.** Mitigation: Turnstile + quotas + spend guard + Anthropic workspace limit.

## 6. What I need from you

See the questions in the conversation. Once they're answered I start M0.
