# Update your working Windows copy from v0.1.0 to v0.1.1

## 28 October: candidate v0.1.2-rc1

The sections below describe the older v0.1.0 -> v0.1.1 update. For this candidate:

1. Keep the working v0.1.1 ZIP/folder untouched as rollback. Stop its server with Ctrl+C.
2. Extract the candidate into a SEPARATE folder and run start_windows.bat there.
   No dependency changes were made. If startup installs Flask, that is environment
   setup for this separate copy, not a new project dependency.
3. Open http://127.0.0.1:5000 and press Ctrl+F5. Check footer/API version 0.1.2-rc1.
4. Run check_windows.bat. Then perform the exact demo below on the real laptop.
5. Review GUIDANCE_CHANGES.md before approving the wording. Status labels remain pending.
6. To roll back: stop candidate, start untouched v0.1.1, refresh browser.

Applied changes: two error-handling corrections in static/app.js; corresponding
controller tests; wording for A01, A04 and A10; supplementary source record S09;
candidate version and release documentation. No routing, frameworks, dependencies,
input fields or JSON response field contracts changed. Banking reference is
included inline in A04 so existing UI/export can expose it without a new schema.

Exact demo: fictional INR 4500 UPI payment to an online seller who requested an
additional fee and stopped responding. India, suspected fraud yes, money moved yes,
credentials no, remote access initially no, bank reported no, official reported no.
Generate -> mark ONLY A06 done -> remote access yes after revealing requested
screen-sharing -> confirm A05 appears incomplete and A06 remains complete -> export.
The base narrative is unchanged; add the screen-sharing fact to optional notes
before exporting if it is to appear in the narrative as well as structured answers.

Completed via API/controller checks, NOT yet verified in an actual browser here.
Refresh clears session state. The new version invalidates old-version completion
tokens, as designed; no cross-version incident persistence is promised.

1. In the terminal running the app, press Ctrl+C. If it says “Press any key”,
   press a key to close the launcher.
2. Keep the old ZIP as your rollback copy. Extract the new ZIP elsewhere.
3. Copy the contents of the new `fraud-first-aid` folder into your existing
   `fraud-first-aid` folder. Choose Replace for same-name files.
4. Keep your existing `.venv` folder. The release does not contain a `.venv`,
   so it does not need to replace it. Dependencies are unchanged.
5. Double-click `start_windows.bat` in the existing folder.
6. Open http://127.0.0.1:5000 and press Ctrl+F5 to refresh the frontend.
7. The footer should show v0.1.1. You can also visit
   http://127.0.0.1:5000/api/health to check the version.
8. Run `check_windows.bat`, then do the browser walkthrough.

Do not overwrite team modifications without reviewing them. These instructions
assume the team has only run the original release, as reported in this chat.

## What changed

- Fixed rapid answer changes while the first assessment is loading.
- Hide obsolete checklist while a replacement assessment is pending.
- Disable initial assessment/demo buttons until questions finish loading.
- Added seven controller tests, a combined self-check, Windows test launcher,
  judge Q&A and 90-second demo script.
- Version increment resets old completion tokens; sessions already clear on reload.
- No routing rules, guidance wording, categories or database statistics changed.

## Five-minute browser gate

Load the payment example -> mark Organise incident facts done -> change remote
access to Yes -> confirm device guidance appears and that fact-organising stays
done -> download/open the summary -> clear the session.

Then load Ordinary pending payment and check it does not receive a confident
fraud finding. Select Another country and verify Indian reporting guidance is
hidden. Report exact observed failures rather than “everything passed” from the
server-startup screen alone.


## 28 October 2026 — Bengaluru integration candidate (not promoted)

Integrated collapsed resource panels below the assessment, four primary-source bank contacts, guarded Maps search, persistent India 1930 access and resource reset. Backend and original tests unchanged. 27 Python, 9 original + 2 new JS tests and 56 scenarios pass. See INTEGRATION_REVIEW.md and INTEGRATION_TEST_OUTPUT.txt. Real Windows browser acceptance remains pending.
