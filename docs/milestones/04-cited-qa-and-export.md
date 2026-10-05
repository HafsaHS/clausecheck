# Milestone 4: Cited Q&A and memo export

> Replaces old M6 + M8. Spec refs: §9 (ask, export), §10.5, §13 (Ask tab, Memo preview), §15 Phases 6–7. Status: not started.

## Goal
Users ask questions about a contract and get short answers where every sentence cites a section and page. Clicking a citation jumps to the clause in the PDF. When the contract doesn't answer, the app says so instead of guessing. The review exports to a Word or PDF memo, marked draft until an attorney signs off.

## Scope
- **Retrieval:** query embedding → `match_chunks` RPC (vector + full-text, RRF) plus a clause-type synonym boost
- **Answering (provider-neutral citations):** the model returns `segments[{text, citations[{chunk_id, quote}]}]`; code checks each quote is a substring of its chunk and drops anything unverified
- Streaming over SSE (segment by segment), citation chips `[§11.2 · p.9]` → PDF scroll and brass highlight pulse
- **Abstention:** fixed "doesn't address" message with the closest sections; answers with zero verified citations are suppressed
- Thumbs feedback, **Escalate** button on every answer, copy answer with citations
- Demo quota: 40 questions per sandbox per day
- **Memo:** one `MemoModel` → DOCX (`docx`) and PDF (`@react-pdf/renderer`): cover, executive summary, risk table, redlines, missing clauses, Q&A appendix, disclaimer, DRAFT/Reviewed banner
- Memo preview page; exports stored in the `exports` bucket and served by signed URL

## Acceptance
- "What's the liability cap?" on the demo contract cites §11.2 p.9; an unanswerable question shows the abstention card → Escalate → task appears
- DOCX opens in Word and LibreOffice; PDF renders; draft banner is correct before and after sign-off
- Unit test `citation-map.test.ts`; integration `ask.test.ts` (SSE shape, abstention, 429)

## Needed from you
- Open one exported memo in Word and confirm it looks right
