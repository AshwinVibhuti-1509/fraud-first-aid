# Current solo-sprint handoff — v0.1.2-rc1

Candidate contains the two confirmed JS fixes and approved minimal guidance edits.
Baseline v0.1.1 / ac07862 remains untouched. No routing/framework/API redesign.
Read UPDATE.md, GUIDANCE_CHANGES.md and VERIFICATION.md first. The original notes
below are historical and do not override the current candidate evidence.

Teammates: review the exact wording; run the demo on the real Windows laptop;
check reset/error flows. Do not merge old P2 patch again: it is already applied.
Do not claim browser PASS based on Node controller fixtures.
Target submission 13:30 IST; strict freeze 14:00 IST on 28 October 2026.

---

# Team handoff — 27 October 2026

## Current state

Idea locked: Fraud First Aid, post-incident assistance. Local MVP v0.1.1 exists.
Python backend + vanilla frontend + original database JSON. No API keys required.
No trained classifier. No government integration. No public deployment.

Implemented: eight structured questions, deterministic relevant checklist,
source/provenance explanations, synthetic demo selectors, answer-change requests,
completion tokens, notices for selected contradictions, text incident export,
input validation, session clearing, responsive styles and keyboard labels.

Verified by execution: 18 hand-authored unit/acceptance/API tests, seven frontend
controller tests, 56 database regression scenarios and JavaScript syntax.
Windows installation/server startup is confirmed by the user's screenshot of v0.1.0.
Not yet verified: browser interactions/rendering, real browser download and Windows v0.1.1 update.
Managed preview could not import Flask in its separate runtime; this does not
establish whether any browser defects remain. Do not call the app demo-ready yet.

## Next tasks in priority order

1. Integration owner applies this update using docs/UPDATE.md and starts the app.
2. Teammate 3 follows MANUAL_ACCEPTANCE.md without changing expected outcomes.
3. Teammate 2 reviews engine.py and test coverage against REQUIREMENTS.md.
4. Guidance reviewer checks SOURCE_REVIEW.md and the original data records.
5. Fix only observed issues. Commit a tested checkpoint before any new feature.
6. Rehearse the 90-second demo; verify event submission format and deadline.

## Explain-back checkpoints

- Frontend owner: explain the JSON request, safe text rendering, session lifetime
  and why a stale result cannot replace a later request.
- Backend owner: explain rule matching, unknown answers, source linkage and
  completion-token invalidation. These tokens are not cryptographic attestation.
- Review owner: explain why synthetic counts are not crime prevalence, why lien
  is not refunded money, and why overseas guidance is labelled as an adaptation.

## AI instructions

Use the current release files, not older concept HTML. One writer per file.
Specify allowed files, exact bug, acceptance outcome and current version.
Return the diff and execution evidence. Do not replace this with another full app.
Do not change routing_rules.json or action wording silently. Document proposed
guidance changes with a source and obtain the team's product decision.

## No feature expansion until core checks pass

Defer charts, ML, chatbot, login, maps, multilingual translation, real-bank APIs,
automatic complaints and extra dashboards. Optional extensions require a clear
benefit and time budget after the demo works on all three laptops.
