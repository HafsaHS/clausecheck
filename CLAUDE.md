# ClauseCheck – contract review AI (demo build, synthetic data)

## Stack
Next.js 16 App Router (TypeScript, Node runtime for API routes), Supabase (Postgres + pgvector + RLS, Auth, Storage, Realtime), LLM behind a provider interface (default Google Gemini free tier via `@google/genai`, Claude via `@anthropic-ai/sdk` as an alternative; model from env LLM_MODEL), Gemini `gemini-embedding-001` embeddings (768d, EMBEDDING_DIMS), Tailwind 4 + shadcn/ui, Vitest, Playwright.

## Commands
- dev: `npm run dev` · types: `npm run typecheck` · lint: `npm run lint`
- unit/integration: `npm test` · e2e: `npm run e2e`
- db: `npx supabase db push` (applies migrations to the hosted dev project; no Docker locally), `npm run db:types`
- eval: `npm run eval:generate`, `npm run eval:run -- --split dev`

## Git
- Never add Co-Authored-By or any AI attribution to commits or PRs.

## Rules
- Never put contract text, questions or answers in logs; use lib/log.ts.
- All LLM calls go through lib/ai/client.ts (provider switch, retries on 429, finish-reason checks, llm_calls logging, cost calc). Don't call a provider SDK elsewhere.
- JSON from the LLM: provider-native structured output (Gemini responseJsonSchema / Claude output_config.format) + zod parse, retry once on failure.
- Citations are provider-neutral: the model returns segments with chunk ids + verbatim quotes; code verifies every quote is a substring of its chunk and drops unverified citations.
- Free-tier rate limits are low: every caller must tolerate 429 with backoff; eval runs use low concurrency.
- Every new table: org_id column + RLS policies + an isolation test in tests/integration/rls.test.ts.
- Server-only modules import "server-only". Service-role client only in lib/supabase/admin.ts.
- Synthetic data only (Gemini free tier may use prompts to improve Google products). Never add real contracts or real company/person names to fixtures.
- Eval numbers in README/UI come from eval_runs only; never hardcode metrics.

## Docs
- Spec: docs/spec.md · Execution plan + polish list: docs/PLAN.md

@AGENTS.md
