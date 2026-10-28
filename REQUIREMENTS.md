# MVP contract — v0.1

Success: on a freshly started local app, a teammate can load a fictional Indian
incident, obtain relevant sourced actions, change an answer, record progress and
download an accurate summary without a paid API or incident persistence.

This implementation adopts the previously recommended Flask + plain HTML/CSS/JS
architecture. The idea is locked; these implementation choices are recorded here
for team review. No new legal remedies or routing conditions have been added.

| Requirement | Acceptance evidence |
|---|---|
| Immediate reporting visible before form | Initial HTML includes bank guidance, 1930 and NCRP links |
| Structured questions with uncertainty | Eight enums; explicit unknown choices; invalid values rejected |
| Relevant actions | Hand-authored tests cover payment, credential exposure, device exposure, routine issue, unknown and other country |
| Explainability | Each displayed action includes a rule rationale and source or team-design label |
| Adaptive checklist | Changed answers trigger backend assessment; irrelevant actions removed |
| Honest completion | Self-reported only; no automated authority verification |
| Correct progress after change | Completion token depends on action, rule, version and relevant answers; changed/removed steps lose marks |
| Incident export | Backend recomputes actions; notes/amount/reference and current progress exported as plain text |
| Unknown amount | Missing remains null; zero is distinct; invalid amounts rejected |
| Privacy | No incident file, database write, analytics, cookie or browser storage; refresh clears session |
| Reliable demo | Documented startup, fictional cases, error state, browser walkthrough and clean-copy test |

## Architecture

Browser -> same-origin Flask JSON endpoints -> deterministic engine -> read-only
JSON rules/actions/sources -> browser rendering. SQLite is not needed by this MVP.
Statistics and synthetic cases are context/test material, not model training data.

## API

GET /api/questions returns {questions, version}.
GET /api/health returns {status: "ok", version}.
POST /api/assess accepts {facts, details?, completed?}.
facts must contain exactly the eight fields/options in data/questions.json.
details optionally includes amount_inr (decimal/string or null), reference (120
characters), notes (1500 characters). completed maps action IDs to opaque tokens
returned by assessment. These tokens prevent accidental stale UI completion;
they are not signatures or proof that an action occurred.

Response: {version, facts, details, actions, unknown_questions, notices,
completed, disclaimer}. Each action includes its source, reason, priority,
completion_token and completed boolean. Source can be null for team suggestions.

POST /api/summary accepts the same payload and returns a UTF-8 text attachment.
400 = invalid input; 413 = request above 16 KiB. No request-body logging is added.

## Progress semantics

Reporting answers describe the starting assessment. Checkbox marks describe
subsequent user-reported steps. Export labels these separately. Clicking a link
does not set completion. Removed steps are dropped from browser completion state.
Changing a relevant fact invalidates a token even if the step remains visible.
Optional notes do not control routing or completion. The UI never analyses notes.

## Known limits / release gates

- Rules retain database v1 review-pending status. A teammate must review guidance.
- Automated checks are assistant-authored, not independent expert validation.
- No natural-language classifier, claim filing, bank integration or recovery prediction.
- Eight questions cannot fully capture every fraud or legal circumstance.
- The local Flask development server is for the hackathon demonstration, not public production.
- Any real deployment requires privacy/security review and production serving setup.
- Official reporting and source sites require internet; installed local workflow does not.
- Setup requires Python 3.10+ and a one-time Flask installation.
