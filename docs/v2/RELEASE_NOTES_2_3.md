# Fraud First Aid 2.3 — Country selector and multi-image workflows

**Status:** Local review candidate. No GitHub push or public deployment. This release extends 2.2; it does not alter the underlying eight-field Flask assessment schema, official reporting logic, or `/classic` rollback.

## User-facing changes

1. **Country selector in the header.** The default is India, with an explicit "Outside India · limited" option. The guided questionnaire no longer asks country as one of the steps: it has seven sequential questions, while the engine still receives all eight fields. Changing country invalidates the prior assessment and self-reported completion state. India-specific urgent links, bank/police resources, and action sidebar are hidden when country is outside India. This prototype does not provide official reporting advice for other jurisdictions.
2. **Multiple-image intake.** The screenshot intake now permits selecting up to **4 PNG/JPEG images in one picker operation**, at most **2 MiB each / 6 MiB combined**. Each image has a separate flattened canvas preview, optional opaque redactions, and a required **Mark this preview reviewed** control. All previews must be reviewed and a fresh explicit opt-in given before processing. When an analysis provider is configured, each sanitized image is sent in a **separate** `/api/evidence/analyze` call; proposed facts are combined conservatively, conflicting suggestions are not auto-applied, and the user still chooses which proposals to confirm. No original input image is sent by the analysis button. The local OCR or AI provider may be unavailable; the manual workflow remains usable.
3. **Batch evidence locker.** The follow-up workspace accepts multiple PNG/JPEG files selected together and links them to the chosen action and evidence type. Capacity increased from **8 files / 8 MiB** to **12 files / 12 MiB**, with **2 MiB per file**. A batch is only added when all its files pass type-signature, decoding, dimensions, count, and combined-size checks. Photos remain in the current browser tab until the user explicitly exports an **unencrypted** local case JSON. The JSON import cap was raised to 20 MiB to account for base64 encoding. Individual image removal and the original JSON case schema remain available.

## Important limitations

- Image selection in the **Evidence Locker** is always local; it is never uploaded to Flask/AI, banks, or police. The separate **Screenshot Intake** transmits approved flattened images only after the user reviews every preview and provides consent.
- The country dropdown is a *jurisdiction scope control*, not real worldwide coverage. The backend supports India and a limited generic 'other' case only.
- An AI or OCR provider is **not automatically available**. Browser verification of the multi-image API flow uses a controlled response adapter, not a live OpenAI/Tesseract provider. No live provider request was performed in this release.
- Exported case files embed raw user-supplied screenshots and are **not encrypted**. They may contain sensitive data or metadata. Do not upload personal IDs, OTPs, PINs, passwords, bank account credentials or actual victim evidence while evaluating the prototype.
- No independent bank/police or regulatory expert assessment; not production-approved. The official portal and bank remain primary contact routes.

## Executed checks (2026-11-01)

- `node --test tests/frontend.test.cjs tests/guided_flow.test.cjs tests/resources.test.cjs tests/release_static.test.cjs tests/batch_country.test.cjs` — **20 passed, 0 failed**.
- `python -m unittest tests.test_release_core tests.test_evidence tests.test_script_loading -q` — **23 passed, 0 failed**.
- `python tests/browser_casework_review.py` — **passed**: original workspace/report flow, action plan, export/import, mobile 375/320px checks.
- `python tests/browser_multi_country_review.py` — **passed**: country selection, seven-step guided assessment, two-image review + consent gate + two adapter calls, redaction consent invalidation, three-image evidence batch, atomic rejection of corrupted batch, case export/import, 320px mobile check. Zero browser JavaScript exceptions observed in these runs.
- Node syntax validation for edited JS — passed.

These checks use local Playwright/Chromium with a **Python engine adapter**, not an independently exercised Flask HTTP server. Live provider functionality, Windows manual acceptance, real user studies, comprehensive accessibility and financial-guidance review are still pending.
