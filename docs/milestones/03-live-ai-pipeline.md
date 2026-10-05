# Milestone 3: Live AI review pipeline

> Replaces old M4 + M5 + M7. Spec refs: §9, §10.1–10.4, §10.6–10.7, §15 Phases 2–5, PLAN §1 (Gemini decisions). Status: not started.

## Goal
Uploading a new contract runs the real review: parse → segment → extract clauses → embed → score against the playbook, with a live step tracker. Attorneys act on the result: redlines, escalations and sign-off. Playbooks are editable and contracts can be re-scored.

## Scope
- **Upload:** `POST /api/contracts` (size/MIME/magic-byte checks, Storage path `{orgId}/{contractId}/{file}`), signed-URL route
- **Parse and segment:** `unpdf` per page (header/footer stripping, de-hyphenation), `mammoth` for DOCX (estimated pages), deterministic section detection; `SCANNED_PDF` error
- **LLM client** `lib/ai/client.ts`: Gemini by default, Claude behind `LLM_PROVIDER`, retries on 429, finish-reason handling, `llm_calls` logging (no text), cost calc
- **Extract:** structured JSON + zod, quotes mapped back to char offsets (exact then fuzzy); unfound quotes dropped
- **Embed:** `gemini-embedding-001` at 768 dimensions, clause-aware chunks
- **Score and missing clauses:** playbook rules → assessments, missing-clause cross-check, `low_confidence` review tasks
- Orchestrator with status updates over Realtime and an animated step tracker
- **Redlines:** generate, word-level diff, Accept/Edit/Reject; only attorneys can accept (UI and DB trigger)
- **Escalation and tasks:** escalate from an assessment, `/app/tasks`, sign-off blocked while tasks are open
- **Playbook editor:** rule editor, version bump on save, re-score with the rationale updated
- `LLM_MODE=replay` for the demo contracts

## Acceptance
- Processing the demo SaaS contract matches spec §12 (cap unacceptable, 2 missing)
- A reviewer can't accept a redline; sign-off is blocked with open tasks
- Editing a rule and re-scoring changes the rationale
- Unit tests: segment, locate-quotes, chunk, cost, schemas; integration: pipeline (mocked LLM), roles, RLS for every table

## Needed from you
- Patience with free-tier limits: a full review makes several Gemini calls, so expect it to take a minute or two
