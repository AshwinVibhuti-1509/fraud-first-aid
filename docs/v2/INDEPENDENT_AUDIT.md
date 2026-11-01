# 2.1 independent code audit — 2026-11-01

**Scope:** The actual uploaded Phase 1 ZIP (not an assumed GitHub main), canonical Flask/Python/JSON files, guided UI and legacy classic UI. This is a code-level engineering audit, not an independent financial/legal review.

| Finding | Evidence | Resolution in 2.1 | Status |
|---|---|---|---|
| Broken payment option | Phase 1 `</option value="payment">` markup | Valid `<option>` and selection test | Corrected |
| Category selection was cosmetic | Phase 1 handler used `start()` for all choices | Explicit incident context plus opt-in proposed facts | Corrected; categories alone never assert fraud |
| Description ignored | Text was only copied to notes | Conservative parser via `/api/intake/interpret`, explicit user confirmation, negative wording safeguards | Implemented; keyword parser not general AI |
| Screenshot misleading | Phase 1 demo had no upload | Actual image picker, opaque redaction canvas, configured OCR/optional vision adapter | Available with configured mode; real AI untested |
| Bank directory and Maps hidden in classic | Only `static/index.html` contained them | Main guided UI has bank list and Bengaluru locality search; contextual actions open bank directory | Restored |
| Uncertain fraud + money moved lost urgent referrals | R01/R02 required fraud=yes | Conditional bank/official assistance for fraud=unknown and moved=yes | Fixed; test added |
| Potential false referral for all-unknown | Blindly broadening R01 could show bank action without known debit | Conditional R01 restricts all-unknown referral; urgent 1930 remains visible | Tested |
| Coercive scenario misclassified as routine | No coercion context | Immediate triage; separate A13 when pressure=yes | Partial: requires source/professional review |
| SIM-specific telecom guidance missing | No SIM action | A14 links Sanchar Saathi, clearly not substitute for 1930 | Added, applicability review pending |
| A04 source was US-centric | A04 pointed to FTC despite Indian safety text | Link to Delhi Police official guidance | Improved; independent guidance review pending |
| Unicode escaped in reports | `ensure_ascii=True` | UTF-8 with `ensure_ascii=False`, JSON string quoting retains line integrity | Fixed and tested |
| No follow-up beyond reporting | Existing checklist ended at reporting | User-confirmed timeline, acknowledgments, self-reported follow-up, all-day `.ics` reminder | Implemented without automatic reporting |
| Liability calculations absent | Existing intentionally excluded RBI complex timelines | RBI 2017 source linked conditionally; no automatic refund/deadline calculations | Deliberately out of release scope pending expert review |
| Duplicate root files | ZIP had canonical files plus root copies | Move legacy root snapshots to `docs/legacy/root-snapshots` | Done; documentation preserved |

## Legacy API compatibility

The eight required `facts` remain mandatory at `/api/assess`. An OPTIONAL validated `context` object provides `incident_type`, `active_pressure`, and `transaction_kind`. Existing callers not providing context continue to work. The additional rules modify action results in a few documented scenarios. See `SCENARIO_MIGRATION.json` and `synthetic_cases_v2.json`.

## Development safety gates

No GitHub push or Render deployment. The original static UI remains at `/classic`. Financial guidance links are official where provided but **not certified advice**. No provider API keys were used. Screenshot OCR uses Tesseract only when installed on the processing host.
