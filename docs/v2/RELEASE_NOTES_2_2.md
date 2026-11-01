# Fraud First Aid 2.2 — Case Status & Evidence Workspace

Status: **LOCAL REVIEW ONLY**. Preserves the 2.1 Flask/Python rule engine and guided frontend. No GitHub push, deployment or government API connection performed.

## Implemented in this release

- New home entry for users who already reported an incident (no assessment prerequisite).
- External official *Track Your Complaint* link with government homepage fallback. OTP/CAPTCHA login stays on the official site.
- Manually entered acknowledgement, observed status message, date/time and a chronological status-check history; explicitly marked user-provided/unverified.
- Capture accessibility issues (slow/unavailable site, OTP/CAPTCHA, missing acknowledgement, no update yet) with direct official State/UT nodal and grievance directory link; **no automatic escalation**.
- Structured complaint-preparation checklist (dates, narrative, bank, transaction ref/date/amount, evidence) inspired by the official portal. Identity document is a private readiness checkbox; this application intentionally has no ID-document upload workflow and tells users not to attach ID scans.
- Official suspect-search links (mobile/email/UPI and website/app) with explicit warning that inclusion is not proof and absence is not reassurance.
- Browser-memory-only PNG/JPEG evidence locker: max 2 MB per file, 8 files, 8 MB aggregate; signature check, browser decode, preview, removal, action association and context labels. No evidence transmission to server from this feature.
- Per-action text-only note log; button within each action card opens workspace preselecting action.
- Opt-in download of unencrypted case JSON containing user-entered fields, timeline, status history, action notes and embedded image data; validated local import; clear removes in-memory proof.
- UTF-8 summary embeds proof **metadata only**; actual images are in explicit JSON case download. Print-to-PDF retains text.
- Existing 2.1 guided/legacy `/classic` UI, description intake, source-linked deterministic actions, bank directory, Bengaluru search, image analysis consent gates, summary and calendar reminders retained.

## Not implemented, and why

- **Actual government complaint-status verification**: no authorized portal API. Requires portal authentication, OTP and CAPTCHA; we do not bypass or collect these. Users check the genuine portal themselves.
- **Verification of uploaded proof**: a screenshot or number can be fabricated; this app never treats either as official authentication.
- **Automatic complaint escalation**: official grievance routes have eligibility and jurisdiction constraints. App links directly to current official directory.
- **Automatic bank/Gov data sync**: no authorized integrations.
- **Identity documents or secure encrypted server storage**: deliberately excluded; local unencrypted JSON export is explained clearly.
- **Legal deadlines/refund calculations, Kannada/Hindi UI**: independent applicable guidance and native-speaker review still needed.
- **Financial guidance and production deployment review**: outstanding.

## Acceptance

The browser test covers manual-status entry, log entry, non-uploaded fictional evidence, basic file checks, export/import including image bytes, invalid JSON rejection without data loss, UTF-8 report, action-to-proof linkage, and 375px layout. It uses a real browser and a Python-engine adapter; it is not a live Flask deployment test. Existing engine and JavaScript tests were separately run. See `TEST_REPORT_2_2.md`.

The earlier 2.1 release remains available separately as rollback. Files from this version should be reviewed against that baseline rather than forcibly replacing GitHub main.
