# Milestone 1: Foundation and app shell

> Replaces old M0 + M1. Spec refs: §5, §7, §8, §13, §15 Phase 1. Status: **in progress**. Repo and tooling are done; auth and shell are being built.

## Goal
A visitor can open the landing page, click **Try the demo** and land in their own sandbox workspace inside the app shell, with no sign-up. A real user can sign in with a magic link and create a workspace.

## Scope

### Done
- [x] Next.js 16 scaffold, Tailwind 4, shadcn/ui, brand tokens, fonts, CI (lint, typecheck, unit tests, build)
- [x] `lib/env.ts` (zod-validated env), `lib/log.ts` (redacts contract text)
- [x] Supabase clients (`lib/supabase/{server,client,admin,proxy}.ts`) and `proxy.ts` gating `/app`
- [x] Init migration applied to the hosted dev project; `lib/supabase/database.types.ts` generated
- [x] Gemini key in `.env.local` and verified
- [x] Vitest and Playwright set up, with a landing-page smoke test

### To do
- [ ] Magic-link sign-in: `/login` page and `/auth/callback` route
- [ ] **Try the demo**: anonymous sign-in → sandbox org "Whitlock & Rao LLP (demo)" with an owner membership (idempotent per user)
- [ ] Create-workspace screen for signed-in users with no org
- [ ] Org switcher (active org kept in a cookie, checked against memberships)
- [ ] App shell: sidebar (Contracts, Playbooks, Tasks, Admin for owners only), header with the demo badge, "Not legal advice" footer, sign out
- [ ] Placeholder pages with proper empty states for Contracts, Playbooks, Tasks and Admin
- [ ] Landing v1: hero, 3 feature rows, eval stat strip (hidden until an `eval_runs` row exists), footer disclaimer
- [ ] Dark mode via `next-themes`; toasts via `sonner`

## Key files
`app/page.tsx`, `app/login/`, `app/auth/callback/route.ts`, `app/app/layout.tsx`, `app/app/*/page.tsx`, `app/actions/{auth,orgs}.ts`, `lib/auth/*`, `lib/orgs.ts`, `components/app/*`

## Decisions
- Server actions replace the spec's `POST /api/orgs` and `POST /api/demo/start`. They do the same jobs with less client code.
- Sandbox cloning of the seeded contracts and playbooks is added in Milestone 2, once the seed exists.

## Acceptance
- `npm run typecheck`, `npm run lint`, `npm test` and `npm run e2e` pass
- Fresh incognito: landing → **Try the demo** → `/app/contracts` with the demo badge; refresh keeps the session; clicking it again doesn't create a second sandbox
- Magic link to your own email signs you in and offers to create a workspace
- `/app` while signed out redirects to `/login`

## Needed from you
- Nothing beyond approving prompts. Supabase's built-in email only sends to your project's team members' addresses, and only a few per hour, so test magic links with your own email.
