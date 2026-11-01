# Execution report — Fraud First Aid 2.1 review candidate

## Actually executed in the current environment (2026-11-01)

- `python -m unittest tests.test_release_core tests.test_evidence -v`: **22 passed**, 0 failed. Includes 11,664 combination checks for action ID uniqueness and non-Indian scope. See `PORTABLE_PYTHON_TEST_OUTPUT.txt`.
- `node --test tests/*.test.cjs`: **17 passed**, 0 failed. Includes 13 previous frontend/controller tests and four new static contracts. See `NODE_TEST_OUTPUT.txt`.
- Programmatic run of updated **56 synthetic scenarios**: 56/56 match updated, documented expectations; see `SCENARIO_MIGRATION.json` for five deliberately changed cases.
- `node --check static/guided.js` and `python -m py_compile app.py engine.py intake.py evidence.py`: pass.
- Real Chromium DOM/controller **browser-internal test** using the actual frontend code and Python engine via an injected API adapter, **not a running Flask server**: homepage, description proposals, opt-in, eight-question review, seven-to-eight-action change, A06 preserved, A05 new/incomplete, bank directory, fictional report download, timeline, reset, mobile overflow = false, screenshot local OCR consent and proposal path, no JavaScript page errors. Desktop, action, report and mobile screenshots saved under `screenshots/`.
- Pillow image decode/re-encode and optional local Tesseract OCR tested with a generated fictional PNG. OCR recognized an invented UPI statement; only proposals shown.

## Not executed / not yet verified

- **Full Flask unittest suite**: Flask could not be installed in this runtime due to blocked dependency network. `app.py` was syntax checked, but Flask actual HTTP routes were not executed here. This remains a Windows/local acceptance gate.
- **Public Render deployment**: not done; GitHub not modified.
- **Live AI vision**: no key or consent to send test images externally, so only adapter design and input-validation checks are included; no assertion of live AI success.
- **Windows/mobile hardware acceptance**: not done; headless Chromium ran in isolated test environment.
- **Human or independent financial-guidance review**: not done. Official primary pages located; applicability to individual cases not professionally validated.
- **Full native Kannada/Hindi translations**: not implemented; current UI English only. Unicode in exports tested.
- **Automatic RBI deadlines/refund entitlements**: explicitly not implemented; complex legal applicability has not been certified.
- **Production privacy, security or accessibility certification, live banking/insurance integration, real users:** not done.

## Release decision

**Conditional GO for fictional-data local acceptance; HOLD for real-user/production deployment.** Run `python self_check.py` on an environment where Flask and Pillow are installed, test all three intake modes that are actually available, and obtain independent procedural guidance and privacy/security review before real-world use.
