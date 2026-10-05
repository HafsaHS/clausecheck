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

Five milestones, each with its own file in [`milestones/`](./milestones/) (scope, acceptance checks, what's needed from Hafsa, status).

| # | Milestone | Outcome | Status |
|---|---|---|---|
| 1 | [Foundation and app shell](./milestones/01-foundation-and-shell.md) | Repo, DB, auth (magic link + "Try the demo" sandbox), org switcher, sidebar shell, landing v1 | In progress |
| 2 | [Review experience on seeded data](./milestones/02-review-experience.md) | Seeded playbooks and demo contracts, 3-pane review screen, PDF highlight, keyboard nav: clickable with no LLM calls | Not started |
| 3 | [Live AI review pipeline](./milestones/03-live-ai-pipeline.md) | Upload → parse → extract → embed → score, step tracker, redlines, escalation, sign-off, playbook editor + re-score | Not started |
| 4 | [Cited Q&A and memo export](./milestones/04-cited-qa-and-export.md) | Hybrid retrieval, streaming cited answers, abstention, DOCX/PDF memo | Not started |
| 5 | [Evals, launch and portfolio](./milestones/05-evals-launch-portfolio.md) | Eval harness + `/evals`, hardening, Vercel deploy, README and Upwork assets | Not started |

Milestone 2 means we have a clickable, good-looking product early, before the live pipeline is tuned.

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
| Phase order | Vertical slice (Milestone 2 review UI before the Milestone 3 pipeline) | Demo-able early; UI isn't blocked on prompt tuning |
| PDF highlight "by char offsets" | Highlight by locating the clause's verbatim text in the pdf.js text layer of its page (normalised fuzzy match), with char offsets as a fallback | pdf.js text-layer spans don't map 1:1 to our normalised offsets |
| Local dev on `supabase start` | Use a hosted Supabase dev project (Docker isn't installed on this machine). Integration tests run against a separate Supabase "test" project or a branch | No Docker locally |
| Anthropic API specifics (`server-side-fallback-2026-07-01` beta, `output_config.effort`, citations + structured outputs) | Verify every param against the installed `@anthropic-ai/sdk` types and current docs before coding the client | Beta names and shapes change; the spec flags this too |
| Eval set size (30 contracts, ~150 hand-checked clause variants) | Keep the size, but generate the variants with Claude and give you a review UI/checklist to approve them in batches | The hand-check is the biggest human time cost in the project |
| Vercel Hobby `maxDuration 300` | OK with Fluid Compute. If processing times out, split into step-per-request driven by status | Hobby limits |
| `POST /api/orgs`, `POST /api/demo/start` | Server actions (`app/actions/orgs.ts`, `app/actions/auth.ts`) | Same behaviour with less client code; a Turnstile token can still be passed in |


## 5. Risks

1. **Clause extraction quality on the 14-page demo contract.** Mitigation: tune on the dev split; seeded demo results come from a real run, reviewed by hand.
2. **PDF highlight precision.** Mitigation: see §4; e2e test that the highlight lands on the expected page.
3. **Free-tier limits** (Supabase pausing, Vercel duration). Mitigation: daily cron hits the DB; replay mode.
4. **Cost leakage from anonymous visitors.** Mitigation: Turnstile + quotas + spend guard + Anthropic workspace limit.

## 6. What I need from you

Each milestone file lists what is needed from Hafsa. In short: approve DB/config changes now; review generated eval clauses, create a Vercel account and record the video in Milestone 5.
