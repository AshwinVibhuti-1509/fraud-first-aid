# Bengaluru integration candidate — v0.1.2-rc1 (not promoted)

28 October 2026. Status: CONDITIONAL GO; human Windows acceptance and guidance review pending.

## Changes from supplied FFA_BASELINE_FOR_ASTRA(1).zip
- static/index.html: Bengaluru title; four official bank resources; police/Maps and bank panels below the assessment, native details collapsed initially; locality disclosure and authorization/jurisdiction warning; persistent 1930 header link.
- static/style.css: teammate support-panel styles plus integration layout, green sticky contact button, accessible targets and enforced hidden state. Existing green/white/amber design preserved.
- static/app.js: teammate Maps search handler with country guard; hide India resources/header contact for OTHER; clear locality/region and collapse resources on reset. Retained all country options, rejecting patch's India-only filtering.
- tests/test_resources.py: two additional resource/demo acceptance tests.
- tests/resources.test.cjs: two additional controller checks, using a fixture derived from the unchanged original frontend test fixture.
- docs/BANK_SOURCES.md: official bank sources, numbers, purposes and verification date.
- docs/INTEGRATION_TEST_OUTPUT.txt: actual test output.
- docs/INTEGRATION_REVIEW.md: this review.
- docs/UPDATE.md: appended integration entry.

Backend, all JSON data, requirements, eight-question schema, original tests and helpline.js are byte-identical to the supplied baseline. Export-integrity patch and completion semantics preserved. No new dependencies. No merge conflicts; no stable promotion. The patch's Kotak entry was excluded (only four banks approved).

## Executed evidence
- PYTHONDONTWRITEBYTECODE=1 python self_check.py: 27 Python tests (25 original + 2 new), all 56 database cases, original 9 frontend tests passed.
- node --test tests/resources.test.cjs: 2 new frontend tests passed.
- API test: seven initial actions; eight after remote access Yes; only A06 completed; exported amount INR 4500.00 and exactly one DONE status.
- Controller tests: download request, reset, error/race regressions, country visibility, Maps URL encoding and no incident-note leakage.
- HTML structure test: resources after checklist, collapsed defaults, exact approved numbers/source URLs and Maps warning.
- Byte comparison: every non-frontend baseline file unchanged before adding this report/update entry.

These are API, parser and controller checks, NOT a new real-browser walkthrough. Existing UI_TEST_REPORT.md and older verification/test reports describe earlier snapshots only.

## Remaining acceptance gates
On the Windows demo laptop, check desktop/mobile layout; expand/collapse resources; India/OTHER switching; seven-to-eight-action scenario with only A06 marked done; download and inspect summary; clear session; open external Maps search; inspect official bank links. Calls were not placed and Maps results were not validated as authorized stations. No station names, addresses or phone numbers are supplied.
Known baseline issue: after editing optional details, press Tab/click elsewhere and wait for assessment before clicking Download. Guidance review remains pending. Numbers may change; use linked official pages. Maps opens an external service and sends only the selected area/locality search.

## Windows startup
Extract the entire ZIP to a NEW folder. Open fraud-first-aid/start_windows.bat. Python's Windows launcher must be installed; first setup needs internet for existing Flask requirements. Keep the terminal open; visit http://127.0.0.1:5000. Use check_windows.bat for existing checks; run node --test tests/resources.test.cjs for added controller checks (Node only needed for tests).
Do not overwrite the stable rollback or run two servers on port 5000. Stop the old server with Ctrl+C before starting this candidate.

## Rollback and approval
rollback/Fraud_First_Aid_MVP_v0.1.1.zip is copied unchanged from the preserved stable archive. Stable checkout at ac07862f9e5d04234abb7c415816ebb523456dea is clean. Candidate remains rc1; no merge or stable tag performed. Team must approve after actual Windows browser acceptance before submission; internal target 1:30 PM IST, freeze 2:00 PM IST.
