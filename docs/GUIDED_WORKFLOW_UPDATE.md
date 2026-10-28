# Guided interface update — 28 October 2026

**Release state:** UI enhancement candidate on top of Bengaluru v0.1.2-rc1. NOT final until Windows acceptance.

## What changed
- First screen shows a single centered incident questionnaire. The source-linked results panel is not displayed until the user selects **Show my next steps**.
- The existing urgent 1930 and official reporting portal remain visible immediately, without answering the questionnaire.
- Successful assessment displays the checklist as a focused second stage. **Edit answers** returns to the form without deleting existing valid completion tokens; **Update my next steps** returns to the refreshed checklist.
- Loading a fictional example fills the form but does not show results until the user clicks the main button.
- Reset returns to the initial questionnaire stage. Backend, routing, JSON fields, completion tokens, bank contacts and Maps search remain unchanged.
- Existing green/white/amber styling retained; simple transition respects reduced-motion settings.

## Evidence
- `node --test tests/*.test.cjs`: 13/13 passing (9 original controller, 2 resources, 2 new guided-flow tests).
- 56 existing synthetic engine scenarios: matched expected action sets.
- Local Chromium DOM/interaction walkthrough using *mocked HTTP fetch backed by the real Python engine*: initial form only, load demo, submit, 7→8 action transition, A06 preserved, A05 pending, incident summary downloaded, reset. **Not a Flask HTTP or Windows browser test.**
- Full Flask-dependent Python suite not rerun here because Flask is absent in this environment. The earlier candidate report documents 27 passing Python tests on Astra's environment; verify again on Windows.
- The reference Replit URL could not be fetched in the audit environment, so no claim of pixel-for-pixel parity is made.

## Mandatory Windows acceptance
Extract to a new folder and run `start_windows.bat`. Test the initial assessment-only layout, then **Show my next steps**, **Edit answers**, 7→8 scenario, download, Google Maps and bank links, reset. Run `check_windows.bat`, plus `node --test tests/resources.test.cjs tests/guided_flow.test.cjs` when Node is available. Keep the prior Bengaluru integration candidate as rollback.
