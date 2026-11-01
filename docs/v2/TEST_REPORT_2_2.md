# Verified execution results — Fraud First Aid 2.2

Review performed locally on Linux, Python 3.13, Node.js 22.16, Chromium 144.0.7559.96. All example incident details are fictional.

## Automated checks performed

| Check | Result | Exact execution |
|---|---|---|
| Portable Python tests for engine, evidence, script loading | **23/23 passed** | `python -m unittest tests.test_release_core tests.test_evidence tests.test_script_loading -v` |
| JS controller tests | **17/17 passed** | `node --test tests/frontend.test.cjs tests/guided_flow.test.cjs tests/resources.test.cjs tests/release_static.test.cjs` |
| Synthetic engine expectations | **56/56 matched** | `engine.assess()` on each case in `data/synthetic_cases_v2.json` |
| Browser integration in real Chromium using Python engine adapter | **Passed tested paths** | `python tests/browser_casework_review.py` |
| Browser JavaScript page errors in tested paths | **0 observed** | Browser `pageerror` listener |
| Mobile viewport overflow (375px) | **No overflow observed** | Chromium `document.documentElement.scrollWidth` |

## Browser workflow verified

- Open local follow-up workspace without a generated plan.
- Enter fictional transaction information, readiness fields, evidence metadata and official check status.
- Add a manual portal-status update and an action-specific note.
- Attach a fictional PNG screenshot (PNG magic checked and browser image decoded) with no upload call.
- Export local unencrypted JSON containing image bytes, narrative, timeline, update history and action notes.
- Clear the session and restore saved JSON (metadata and photo returned).
- Reject a malicious HTML-data-URI attachment on import without discarding existing data.
- Download UTF-8 text report independently of a generated plan.
- Run a category-based 8-question user journey against the real Python rule engine.
- Use an action-card button to open workspace with corresponding action preselected.
- Test a 375px mobile viewport without horizontal overflow.

## What these checks DO NOT establish

- **Flask HTTP test suite not executed in this environment.** Flask was unavailable here; the browser test intercepts the HTTP API and passes requests to the real Python engine via a controlled adapter. The supplied project still requires a Windows/Flask acceptance run.
- No real government portal login, acknowledgement/status query, integration, or OTP/CAPTCHA bypass was performed. External links were source-reviewed, but external availability was not tested through the browser.
- No real payment, bank transfer, or official complaint was filed.
- No malicious-file sandbox, formal penetration test, encrypted evidence store, professional financial review, native-speaker translation review, or comprehensive assistive-tech audit was conducted.
- No live AI vision-provider request was made; that remains an optional separately configured 2.1 feature.
- No real-user usability evidence collected.

## Recommendation

**Conditional go for user-owned Windows/local acceptance; hold for public deployment and real financial-use claims.** See `START_HERE.md`, the official source notes, and `SECURITY_PRIVACY_2_2.md`.
