# Fraud First Aid 2.3 — Country selector and multiple screenshot workflows

**Review candidate.** The country dropdown is now in the header, and the guided flow uses seven questions with the selected country as the eighth existing backend field. The screenshot intake can prepare **up to four images at once**, each requiring individual preview, redaction review, and explicit opt-in before a configured provider may process it. The follow-up Evidence Locker can add **up to twelve screenshots (12 MiB total; 2 MiB each)**, including multiple files in one selection, without transmitting them to the server. **See [release notes](docs/v2/RELEASE_NOTES_2_3.md).**

**No real screenshot-analysis provider is guaranteed or newly enabled.** OCR/AI methods are offered only when configured. Status tracking is user-recorded, not government verified. No public deployment was performed.

---

# Fraud First Aid 2.2 — Local case evidence and official follow-up

**Status:** Review candidate. Not an official reporting service; do not use this app to delay contacting your bank or India's 1930 helpline. Real complaint status is checked **only on the official government portal**, not through our app. This application cannot prove whether a complaint is taken up, investigated, or closed.

**Start here:** [`START_HERE.md`](START_HERE.md) and [`docs/v2/RELEASE_NOTES_2_2.md`](docs/v2/RELEASE_NOTES_2_2.md).

What's new since 2.1: direct follow-up access from the homepage; official status-check links and user-entered observations; issue/delay history; complaint readiness checklist based on the portal's own information list; official suspect-identifier search links; evidence screenshots and action-specific text notes **stored in tab memory only**; explicit local JSON export/import (NOT encrypted); and evidence metadata in the UTF-8 report. All earlier 2.1 features and `/classic` remain available.

**Privacy:** No screenshot in the *follow-up Evidence Locker* is sent to Flask, AI, banks or police. Only the existing separate, opt-in *screenshot analysis* intake can transmit its explicitly approved redacted preview to the backend. Text assessment/summary requests still reach the Flask backend. Browser hosting, browser downloads, and third-party official sites have their own data handling.

---

# Fraud First Aid — 2.1 review candidate

**Guided first response for suspected digital financial fraud in India.**

A focused student-built incident-response companion: find the official channels without waiting; describe what happened or choose a situation; confirm any inferred facts; receive a context-sensitive, source-linked action plan; organise information for official reporting; and keep your own follow-up notes. **It does not identify fraud conclusively, file complaints, contact banks on your behalf, calculate liability or guarantee recovery.**

**Status: local-review candidate, not a public financial-advice service.** Do not enter actual banking secrets, private financial screenshots or sensitive victim details. Independent guidance review, human usability testing and a production security review are pending. Developed from the original DECAcode 2026 Wall Street Wolves project and Phase 1 candidate, with team attribution retained.

## Windows — quick start

Extract the release ZIP, enter the nested `fraud-first-aid` folder (the folder containing `app.py` and `requirements.txt`), then open **Command Prompt** there (not the `>>>` Python interpreter):

```bat
py -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
```

Then visit **http://127.0.0.1:5000/**. The previous interface remains at **http://127.0.0.1:5000/classic**. Keep the command window running. If `py` isn't available, use `python` to create the virtual environment.

**Important:** Do not run the commands in the parent folder containing the ZIP. The project is inside the `fraud-first-aid` folder.

## What is implemented

- Immediate `1930` and government portal links, and contextual bank directory (SBI/HDFC/ICICI/Axis).
- Bengaluru external Maps search, labelled as a search rather than verified police jurisdiction.
- Guided intake with description-based conservative keyword suggestions, selectable incident categories, optional triage for pressure and money movement, confirmation before assessment.
- Source-linked deterministic rule engine, legacy eight-field contract preserved, additional user-confirmed context supported.
- Corrected bank/report routing for uncertain suspicious debits; coercion and SIM context additions, optional RBI information without legal-entitlement calculations.
- Adaptive checklist with context-sensitive completion preservation.
- Incident workspace with dates, references, a user-entered timeline, self-reported follow-up, Unicode TXT report, print-to-PDF via browser and user-chosen `.ics` reminder.
- PNG/JPEG selection with browser-side opaque redaction and flattened preview. **Optional** OCR via locally installed Tesseract; **optional** AI extraction via a configured server-side provider and explicit consent. If unconfigured, the app disables the unavailable mode. Neither performs a definitive fraud classification.
- Server-side image validation and re-encoding with Pillow, endpoint-specific request limits, source-linked documentation and regression tests.
- Session-only client state by default. No user accounts or incident database.

## What is NOT ready

- Public production deployment or security certification.
- Real provider-AI integration end-to-end testing (no key configured during release review).
- Full Kannada/Hindi UI or reviewed translations (Unicode summaries and Hindi/Kannada notes are supported).
- Automated RBI compensation/deadline calculations (too many case-specific conditions; **do not assume a universal refund window**).
- Real user outcomes, external financial expert validation, or official police/bank integrations.
- Guaranteed OCR availability on hosted deployment (Tesseract is an optional system executable, not a pip dependency).

## Image processing

1. Select a PNG/JPEG file <= 2 MB, <= 6 MP.
2. Drag over sensitive regions to redact them in the displayed canvas.
3. Choose an **available** analysis mode (local OCR or optional OpenAI vision).
4. Check the preview and give explicit consent. Consent resets when an image or redaction changes.
5. Review suggested facts and confirm which to apply.
6. Manually correct every answer before requesting the plan.

**Local OCR:** Install the native Tesseract executable on the server/Windows machine and add it to `PATH`. A detected executable is required for this option. The processed image is still sent from your browser to this Flask server, but no external AI is called.

**AI vision:** Disabled by default. To try in a private test environment, set `FFA_ENABLE_AI=1` and `OPENAI_API_KEY` as server environment variables and optionally `FFA_AI_MODEL`. Do not put secrets into a `.env` committed to GitHub; `app.py` does not automatically load `.env`. This optional adapter uses an OpenAI image-capable model via API and **has not been exercised with a real key**. Third-party processing and retention depend on provider policies; do not upload real private user evidence until provider processing and security have been reviewed. Calls may incur fees.

## Development checks

```bat
.venv\Scripts\python.exe self_check.py
```

This runs the full Flask-based Python suite, 56 updated synthetic cases, and Node tests if Node is available. Python-only portable tests: `python -m unittest tests.test_release_core tests.test_evidence -v`; Node tests: `node --test tests/*.test.cjs`.

See `docs/v2/VERIFICATION_2_1.md` for which checks were actually run here, the QA environment limitations, and evidence from the isolated-browser test. Screenshots are in `docs/v2/screenshots/`.

## Architecture

`static/guided.html` + `guided.js` + `guided.css` (UI) → `app.py` (Flask) → `intake.py` (conservative text suggestions), `evidence.py` (opt-in image processing), `engine.py` (deterministic actions) → canonical `data/*.json`. Downloads are composed in the browser using server-provided action summary + self-entered incident workspace notes. `static/index.html` remains the legacy classic interface.

## Safety and source provenance

Immediate official reporting: https://cybercrime.gov.in/ and `1930`. Basic Indian RBI customer protection guidance: https://rbi.org.in/commonman/Upload/English/Notification/PDFs/NOTI1506072017.PDF (only for the circumstances to which it applies; not a universal reimbursement promise). Sanchar Saathi: https://www.sancharsaathi.gov.in/ (suspected fraudulent communications and mobile-related services, not a substitute for reporting financial loss).

Sources are recorded in `data/sources.json`; **source-linked does not mean professionally certified**. Review status is explicit. For high-stakes decisions, users should follow their bank and relevant authorities.

## Deployment

The repository contains `render.yaml` for a Python/Flask web service. Run manual browser checks and independent guidance/security reviews **before** publishing for actual users. Do not push or deploy this candidate without the owner's approval. See `README_DEPLOY.md`.

## History

This candidate preserves the original UI under `/classic`, keeps legacy tests and supporting documents in `docs/legacy`, and retains the old synthetic case set alongside the revised scenario set. GitHub main was not changed as part of this package. Credit the original Wall Street Wolves collaborators when publishing; any solo competition reuse requires their agreement and accurate attribution.
