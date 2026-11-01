# Release candidate 2.1 — implementation summary

## Fully working in available automated tests

1. Redesigned responsive homepage (see screenshots) and three paths into a fact-confirmation workflow.
2. Deterministic, negation-aware incident description suggestions with opt-in checkboxes and an actual server endpoint.
3. Category context and focused triage for ongoing pressure, money movement, and possible exposure.
4. Rule engine improvements, 18 available action definitions, source-linked conditional guidance and preserved SHA-256 completion tokens.
5. Restored bank directory and Bengaluru external Maps assistance directly in the guided interface.
6. Incident workspace with user-entered timeline, acknowledgment references, follow-up state, printable and downloadable Unicode report, and user-chosen calendar reminder.
7. Actual file-input and local browser canvas opaque redaction. Optional image processing via installed Tesseract OCR or provider AI with opt-in consent and server-key configuration. No pretending to use AI when disabled.
8. Preserved original `/classic` interface, retained legacy tests/history, and documented source attribution.

## Implementation versus production status

This is a **review candidate**, not a service for real victims. Full Flask HTTP tests couldn't run in this environment because dependencies were unavailable; independent Python/Node tests and isolated Chromium controller tests did run and passed. No real AI key was configured or used, and automatic legal deadlines or language translations weren't introduced as unverified features. Independent expert financial-guidance review, privacy/security deployment review, and human Windows/mobile verification remain mandatory.

## Test evidence

- Portable Python: **22 passed**.
- Existing Node 13 plus four additional contracts: **17 passed**.
- Synthetic scenarios: **56 passing** against revised documented expectations; five original expected plans deliberately changed and preserved in the migration file.
- Engine finite state uniqueness: **11,664 legacy combinations** checked.
- Actual HTML/CSS/JS in Chromium with in-process engine API adapter: description → proposed facts → triage → questions → plan 7 → revised plan 8 + preserved progress → bank support → report/timeline → reset; responsive screenshots and OCR with explicit consent. **This was not a running Flask web service.**

See `VERIFICATION_2_1.md` for limitations and exact commands.
