# Fraud First Aid 2.3 — Start Here

This version adds the **country selector** (top-right on desktop; in the header on mobile), **multiple image intake** (max 4 PNG/JPEG files; 2 MiB each; 6 MiB total), and **batch evidence attachments** (max 12 files; 2 MiB each; 12 MiB total).

On Windows, extract this ZIP, open the **fraud-first-aid** folder containing `app.py`, and run these commands in Command Prompt, not inside Python `>>>`:

```cmd
py -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
```

Then open http://127.0.0.1:5000/ . The original `/classic` page remains available.

## Quick review

1. Change **Guidance for** to **Outside India · limited** in the header. Confirm India-only links are hidden. Change back to India. This selector replaces the country question, **not** the eight-field backend contract.
2. Choose **Use a screenshot** and select two **fictional** PNG/JPEG screenshots together. Switch between previews, redact any sensitive areas, mark *each* preview reviewed, then explicitly consent to the selected processing method. If no provider is configured, use manual intake instead; do not expect a fake AI result.
3. Open **Follow-up workspace** and choose **multiple fictional PNG/JPEG files** together under Personal Evidence Locker. Select a linked action/type and click **Add selected screenshots**. Confirm every file appears; test individual removal and export/import. These files stay in the browser tab unless **explicitly exported** to an unencrypted JSON file.
4. Complete the guided flow. There are **seven steps**, plus the selected country in the header. Review the facts, build a plan, and test the official reporting and bank-support links.

## Cautions

- No real banking, government or insurance integrations. The app cannot prove that a complaint was filed.
- The government and bank remain primary reporting channels; do not delay reaching them.
- **Evidence Locker** images are not uploaded to our server. **Screenshot Intake** transmits only individually reviewed sanitized images after consent, if an analysis method is configured.
- Real user testing and independent guidance/security review are not complete. Keep using fictional files in development.
- Case JSON exports embed user-supplied image data and are not encrypted.

See `docs/v2/RELEASE_NOTES_2_3.md` for changes, tested behavior and limitations.

---

# Fraud First Aid 2.2 — Start Here

This is a **working local review candidate**, not an authenticated complaint-tracking service. It maintains the existing Flask rule engine and adds an opt-in, browser-only evidence and follow-up workspace.

## On Windows

Extract this ZIP. Open Command Prompt **inside the `fraud-first-aid` folder**, where `app.py` and `requirements.txt` appear. Do not paste commands into the Python `>>>` interpreter.

```
py -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
```

Alternatively, double-click `start_windows.bat`. Visit http://127.0.0.1:5000/ . The earlier interface is at http://127.0.0.1:5000/classic .

## Test the new feature with fictional information

1. On the homepage click **Open my follow-up workspace**. It works even without a generated action plan.
2. Select a user-observed portal stage, add your own message and a date, and press **Add a dated follow-up record**.
3. Enter an imaginary UTR, bank name, incident time, date and narrative. The complaint-preparation checklist updates; do **not** upload identity documents here.
4. Add a **fictional PNG/JPEG screenshot** to a chosen action. The image stays in the tab; it does not upload to Flask.
5. Add an action-specific text note. Download a UTF-8 summary and a personal case JSON file.
6. Click **Clear all session information**, return to the workspace and **Restore my exported case file**. Confirm that your timeline, notes, portal observations and image return.
7. Verify the external links open the *real* official cybercrime portal. Tracking/OTP/CAPTCHA occurs **only there**. This app must never request or intercept government OTPs.
8. Also test the description/category intake, action plan, links to banks and Bengaluru police search, and `/classic`.

## Limitations

- No government system integration, complaint verification, or automatic status checks. All stored status text and evidence are user-provided.
- Evidence files and their metadata live in the current browser tab; closing the tab loses them unless explicitly exported.
- Exported JSON embeds images, is **not encrypted**, and must be stored privately. Do not share it casually or upload national ID proofs here.
- Current original AI vision remains optional and off without provider keys. The Evidence Locker never uses AI.
- No source-verified regulatory deadlines or refund calculations. Check official current instructions.
- External government sites may change or be temporarily unavailable; use the portal homepage as a fallback.
- Human financial-guidance, accessibility and Windows acceptance are still pending. Do not advertise as production-ready.

## Test commands

```
.venv\Scripts\python.exe self_check.py
node --test tests/frontend.test.cjs tests/guided_flow.test.cjs tests/resources.test.cjs tests/release_static.test.cjs
```

Optional desktop browser regression requires Chromium and Python Playwright: `python tests/browser_casework_review.py` (the supplied adapter test uses a real Python rules engine, **not** Flask HTTP).

Read `docs/v2/RELEASE_NOTES_2_2.md` and `docs/v2/PORTAL_SOURCE_NOTES_2_2.md` before publishing.
