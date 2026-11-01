# Fraud First Aid 2.0 — audit and delivery boundaries

Baseline inspected: GitHub main 877eac5f60d3c631875881c3376e2a9bd93f9288 (31 October 2026).
Preserved local branch: baseline/pre-v2-877eac5. Candidate: feature/guided-intake-phase1.
GitHub connection has no push permission. Neither deployment nor remote branch is modified.

## Audit
Flask validates exactly eight facts and serves a stateless assessment/summary API. JSON rules, action text and source records determine responses. Completion tokens incorporate action/rule context. Export escapes user text. The UI has a two-stage form but still shows all eight questions together. Screenshot analysis and evidence storage do not exist. Some root files duplicate canonical static/data/tests/docs paths. This change will not restructure those files.

## Necessary changes for first delivery
- app.py: serve new guided homepage; expose untouched old UI at /classic.
- static/guided.html, guided.css, guided.js: three intake routes, progressive questions, review screen, error/retry/reset, source-linked action centre and existing text export.
- static/fictional-evidence.svg: visibly fictional non-sensitive screenshot fixture, not an accepted upload format.
- tests/test_guided_v2.py and browser acceptance script: routes, disabled upload boundary, question coverage, completion/export/reset and mobile behavior.
- docs/v2/: audit, architecture, security design and execution evidence. Existing documentation/tests are retained.

No changes planned to engine.py, data/*.json, current controller, dependencies or current UI assets. No AI API calls. No real file picker, image upload endpoint or file persistence.

## Architecture
Browser intake -> user-reviewed eight facts -> existing POST /api/assess -> deterministic action centre.
Optional text -> explicit review -> existing details.notes -> escaped POST /api/summary export.
Description is not classified. Categories identify a starting concern but do not infer money movement, exposure or reporting status.
Fictional sample -> labelled static proposed facts -> explicit apply -> eight editable questions -> review -> assessment. This is a UI demonstration, not image analysis.
Current source action text is displayed as How; rule rationale as Why; preparation prompts are generic team-designed record-organisation prompts. No new financial/legal instructions.

## Later required phases, NOT enabled here
Real image processing, redaction and provider consent are separate security-reviewed work. A timeline should contain only user-confirmed events; timestamps must be supplied or remain unknown, not inferred from form answers. Timeline schema/export changes require versioned contracts and additional tests. This phase preserves existing notes and export, not a fabricated timeline.

## Optional enhancements
Language localization after review, downloadable evidence bundle, accessibility audit with assistive technology, five-person usability study, screenshots/video for README. No new framework, accounts, automatic complaint filing or bank API.

## Acceptance gates
1. Urgent India reporting access before intake and throughout the supported-country flow; OTHER hides India-specific links and uses existing A12 routing.
2. Three labelled options; real upload disabled; fictional demonstration explicitly labelled, no simulated AI latency or claims.
3. All eight schema facts remain available, including each existing Unknown option; back navigation retains values. Review shows all answers before sending.
4. Category/description never silently determines facts. Notes remain local until explicit assessment; no secrets required.
5. Seven-to-eight-action demo preserves only valid A06 completion and introduces A05 incomplete.
6. Export stays factual/escaped, completion is self-reported, no complaint-submission claim.
7. Reset invalidates pending responses, clears description/proposals/notes/facts/completion; pending exports cannot download after reset.
8. Keyboard navigation, mobile viewport without horizontal overflow, focus on each step, errors remain recoverable.
9. All existing tests + 56 regression scenarios pass. Record actual browser evidence separately; never infer a browser pass from API tests.
