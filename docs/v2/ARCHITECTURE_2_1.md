# Architecture — review candidate 2.1

## Client → backend sequence

1. Homepage always exposes immediate Indian reporting info before intake.
2. **Description** → `POST /api/intake/interpret` → `intake.py`: conservative proposed fields and amount; user opts in to each proposal; uncertain facts remain `unknown`.
3. **Category** → same proposals endpoint with category → potential UPI rail suggestion; category is explicitly user-selected incident context, not diagnosis.
4. **Screenshot** → locally selected canvas → user draws opaque redactions → flattened PNG → per-image consent → `POST /api/evidence/analyze` → `evidence.py` validates/re-encodes the PNG → locally installed Tesseract OR configured third-party vision provider → schema-limited suggestions → user confirmation. Unavailable modes disabled.
5. **Triage** → captures active pressure and money moved before longer questions, displays urgent protective prompts, but does not hold the user back from official resources.
6. **Existing eight questions** → all validated by unchanged interface contract plus optional context.
7. **Action centre** → `POST /api/assess` → `engine.py` + canonical `data/*.json`; SHA-256 completion tokens preserve applicable progress when the context remains unchanged.
8. **Incident workspace** → session-only browser state, manually entered timeline, user-confirmed acknowledgments, downloaded UTF-8 report and all-day `.ics` reminder. The printable page uses browser print-to-PDF. **No form data is submitted to authorities.**

## Primary endpoints

| Endpoint | Input | Output |
|---|---|---|
| `GET /api/questions` | none | eight questions |
| `GET /api/intake/options` | none | categories, availability of OCR/AI modes |
| `POST /api/intake/interpret` | description <=1500 chars, category | suggested facts, caution and proposed amount |
| `POST /api/evidence/analyze` | flattened PNG, mode, explicit consent + preview confirmation | proposed facts and observations (or clear failure) |
| `POST /api/assess` | eight facts, optional context/details/completed tokens | action plan |
| `POST /api/summary` | same assessment payload | readable UTF-8 text (no saved case) |
| `GET /classic` | none | legacy UI for comparison/rollback |

## Image processing security boundary

Flask ordinary JSON capped to 16 KiB per request, evidence endpoint 3 MiB. PNG flattened image limited to 2 MiB and 6 megapixels after re-encoding with Pillow. No raw screenshots written to disk by the app. OCR uses subprocess stdin with 12-second timeout, model adapter uses one HTTPS call with 18-second timeout. In-process image attempt limiter is basic—not production abuse defence. Real provider processing, retention and jurisdiction must be reviewed before actual users are admitted.

## Changes intentionally NOT introduced

No React or database, no external browser scripts, no auto-persistence, no automatic transfers, no bank login, no fake AI analysis, no simulated expert sign-off, no automated statutory deadline engine, no user identity storage.
