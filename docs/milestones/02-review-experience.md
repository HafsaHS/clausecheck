# Milestone 2: Review experience on seeded data

> Replaces old M2 + M3. Spec refs: §12, §13 (Review screen), §15 Phase 5 (UI part), PLAN §3 polish list. Status: not started.

## Goal
The demo looks and feels finished **before any live AI runs**. A visitor opens the sample SaaS contract and sees the full review screen (risk summary, clauses, PDF with highlights, missing-clause card, injection banner), all driven by hand-authored seed data.

## Scope
- **Seed fixtures (synthetic only):** 3 playbooks (SaaS–Customer, Mutual NDA, MSA–Vendor) and 3 pre-processed demo contracts (Acme–Nimbus SaaS 14p, Harbor & Pike NDA 4p, Fieldworks MSA DOCX 11p) with their pages, clauses, assessments, missing clauses and chunks, matching spec §12
- Generate the 3 demo files (PDF/DOCX) so the PDF viewer has something real to show
- Demo template org plus cloning into each new sandbox (hooks into Milestone 1's **Try the demo**)
- Contracts list: table, status chips, risk counts, sample cards in the empty state
- **Review screen:** 3-pane layout (clause list grouped by risk | PDF viewer | clause drawer), risk summary bar, missing-clauses card, injection banner, Draft/Reviewed badge
- PDF viewer (`react-pdf`) with highlight by locating the clause text in the page's text layer (PLAN §4)
- Keyboard: `j/k` between clauses, `Enter` opens the drawer; `⌘K` command palette
- Skeletons that match the layout; collapses to tabs under 1024px
- Sandbox opens straight on the SaaS contract, plus a first-run coach-mark tour

## Acceptance
- **Try the demo** → 3 sample contracts → SaaS shows 3 high risks and 2 missing clauses → click Limitation of Liability → PDF jumps to p.9 with the clause highlighted (Playwright `demo.spec.ts`)
- No real company or person names in the fixtures
- Lighthouse accessibility ≥ 95 on the review page

## Needed from you
- A quick look at the review screen to sign off on the look before the live AI is wired in
