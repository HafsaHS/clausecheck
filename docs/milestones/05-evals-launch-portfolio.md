# Milestone 5: Evals, launch and portfolio

> Replaces old M9 + M10 + M11. Spec refs: §11, §14, §16–§21. Status: not started.

## Goal
The accuracy claims are measured, the app is hardened and live on a public URL, and the Upwork portfolio package is ready, with every number taken from a real eval run.

## Scope

### Evals
- Clause library YAML (24 types × 4–8 variants, expected position per side), deterministic generator (`--seed 42`), PDF/DOCX renderers recording gold spans
- Runner reusing `lib/pipeline`, matching (type + IoU ≥ 0.5), all metrics in spec §11.2, LLM judge only for non-numeric answers
- Concurrency 1 by default (free-tier limits); results published to `eval_runs`
- Public `/evals` page: stat tiles, per-type table, failures drawer, run history

### Hardening
- Rate limits, demo quotas, global daily spend guard with a friendly "Demo budget reached" state
- Security headers (CSP etc.), Turnstile on anonymous sign-in, custom 404/500, an error boundary per pane
- Daily cron `/api/cron/reset-demo` (deletes sandboxes and anonymous users older than 24h; also keeps Supabase from pausing)
- Admin page: members and roles, cost per contract, audit log
- Full test suite per spec §16, including axe accessibility checks

### Launch and portfolio
- Vercel deploy, production env vars, `CRON_SECRET`, Supabase redirect URLs for the live domain
- Seed script runs the real pipeline once for the demo contracts
- README per spec §18 (GIF, live link, eval table from `eval_runs`, synthetic-data caveat)
- Thumbnail, 6 gallery images, 75-second video script, Upwork entry text

## Acceptance
- Spec §21 checklist fully ticked
- `/evals` shows the published test-split run; all public numbers match it exactly

## Needed from you
- **Review about 150 generated clause variants** (a checklist UI will be provided); this keeps the eval honest
- Create a free **Vercel** account and connect the GitHub repo
- Optional: a free **Cloudflare Turnstile** site key
- Record the 75-second video and publish the Upwork entry
