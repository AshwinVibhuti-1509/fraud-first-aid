# Guided intake candidate — start here

This package implements the first 2.0 deliverable, not all four product phases. Read PLAN.md, EVIDENCE_SECURITY_DESIGN.md and VERIFICATION.md before integrating.

## Windows local preview
Extract the ZIP, open a terminal inside `fraud-first-aid`, then run:

```bat
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python app.py
```

Open http://127.0.0.1:5000/ for guided intake. `/classic` opens the preserved original interface. Keep the terminal open. Never paste real credentials into either UI.

## Verify
With Node.js installed:

```bat
.venv\Scripts\python self_check.py
```

Optional additional UI tooling (separate directory; not an app dependency):

```bat
npm install --prefix ..\ffa-test-tools jsdom@26.1.0 playwright@1.51.1
set NODE_PATH=%CD%\..\ffa-test-tools\node_modules
node --test tests/dom_guided_v2.cjs
node ..\ffa-test-tools\node_modules\playwright\cli.js install chromium
```

Start the app in a separate terminal with `app.py --port 5062`, then run `node tests/browser_guided_v2.cjs`.

## Review and integrate without overwriting main
The outer ZIP includes a Git bundle containing the untouched baseline branch and candidate branch, plus a minimal patch. Neither branch has been pushed. To create a separate review checkout from the bundle:

```bat
git clone -b feature/guided-intake-phase1 fraud-first-aid-v2.bundle fraud-first-aid-review
cd fraud-first-aid-review
git branch rollback/pre-v2 origin/baseline/pre-v2-877eac5
git diff origin/baseline/pre-v2-877eac5..HEAD --stat
```

Run tests and the human walkthrough before integrating into your real repository. Check for newer remote commits first; do not overwrite them with this archive. Integrate the candidate commit on a review branch, resolve any conflict deliberately, retest, then merge/deploy only after your acceptance. The bundle's baseline branch remains available for rollback.

## Human walkthrough
Try all three intake choices. For the fictional screenshot demo, confirm its proposals, answer India / Yes / Yes / UPI / No / No / No / No, and opt in to its fictional notes. Build the seven-action plan. Complete only Organise incident facts. Edit remote access to Yes and rebuild: eight actions, previous completion retained, device action incomplete. Download and review the summary. Reset, check fields cleared, and try Another country to check India contacts disappear. Also test a failed request and retry.
