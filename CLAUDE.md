# ClauseCheck – contract review AI (demo build, synthetic data)

## Stack
Next.js 16 App Router (TypeScript, Node runtime for API routes), Supabase (Postgres + pgvector + RLS, Auth, Storage, Realtime), Anthropic `@anthropic-ai/sdk` (model from env LLM_MODEL, default claude-opus-5-5), Voyage voyage-law-2 embeddings (1024d), Tailwind 4 + shadcn/ui, Vitest, Playwright.

## Commands
- dev: `npm run dev` · types: `npm run typecheck` · lint: `npm run lint`
- unit/integration: `npm test` · e2e: `npm run e2e`
- db: `npx supabase db push` (applies migrations to the hosted dev project; no Docker locally), `npm run db:types`
- eval: `npm run eval:generate`, `npm run eval:run -- --split dev`

## Rules
- Never put contract text, questions or answers in logs; use lib/log.ts.
- All Claude calls go through lib/ai/client.ts (fallbacks, stop_reason checks, llm_calls logging, cost calc). Don't call the SDK elsewhere.
- JSON from Claude: structured outputs (output_config.format) + zod parse. Don't use forced tool_choice (rejected on Opus 5.5). Q&A uses citations, which can't be combined with output_config.format.
- Don't set thinking budget_tokens or temperature (rejected on Opus 5.5); set output_config.effort explicitly.
- Every new table: org_id column + RLS policies + an isolation test in tests/integration/rls.test.ts.
- Server-only modules import "server-only". Service-role client only in lib/supabase/admin.ts.
- Synthetic data only. Never add real contracts or real company/person names to fixtures.
- Eval numbers in README/UI come from eval_runs only; never hardcode metrics.

## Docs
- Spec: docs/spec.md · Execution plan + polish list: docs/PLAN.md

@AGENTS.md
