# Fraud First Aid — Bengaluru Hackathon Demo

**Wall Street Wolves | DECAcode 2026 | Financial Inclusion & Personal Finance**

A source-linked **post-incident financial fraud response** prototype for Bengaluru. It does **not** detect fraud, access bank accounts, file official complaints, certify recommendations, or guarantee recovery. For suspected financial cyberfraud in India, the interface prioritizes official reporting through **1930** and [cybercrime.gov.in](https://cybercrime.gov.in/).

### Current demo experience

- Guided **eight-question incident assessment**, followed by **Show my next steps** and **Edit answers**.
- Deterministic Flask/Python/JSON rules with source-linked adaptive actions and self-reported progress.
- Downloadable text incident summary and per-session browser-memory state (no account or stored victim records).
- Bengaluru region-based **external Google Maps search** for police assistance, not a confirmed nearest or jurisdiction-authorized station.
- Bank reporting-resource links with contact-purpose qualifications; always verify contact information against the bank's own site.

**Demo status:** Event-day candidate; automated tests have been recorded, but public Render deployment and its complete browser workflow must be verified separately before treating the site as operational. Use fictional incidents for demonstration.

For deploying this repository, see [README_DEPLOY.md](README_DEPLOY.md).

---

# Fraud First Aid — v0.1.2-rc1 candidate

Candidate for teammate review, not yet browser-approved. Stable rollback is
v0.1.1 / ac07862. See docs/UPDATE.md, docs/GUIDANCE_CHANGES.md and
docs/VERIFICATION.md for this sprint's changes and actual evidence.
Submission target: 1:30 PM IST, October 28; strict freeze: 2:00 PM IST.

A local, source-linked post-incident checklist for suspected financial fraud.
Built for the three-person Wall Street Wolves team. Prototype, not a recovery service.

## Acknowledgments / External Resources

- **Software:** Python and its standard library; Flask 3.1.2, with its installed
  dependencies Werkzeug, Jinja2, MarkupSafe, Click, ItsDangerous and Blinker.
  The frontend uses standard HTML, CSS and JavaScript without a third-party UI
  framework. Node.js built-in test/VM facilities support controller tests and an
  optional preview helper; Node is not required to run the app.
- **Indian public sources:** [RBI customer guidance](https://www.rbi.org.in/commonman/english/Scripts/SMSLimitedliability.aspx),
  [MHA/PIB cybercrime reporting and statistics](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2287039&lang=1&reg=1),
  and [Delhi Police phishing/vishing guidance](https://cyber.delhipolice.gov.in/vishing.html).
  The app links users to the [National Cyber Crime Reporting Portal](https://cybercrime.gov.in);
  it has no government affiliation or reporting integration.
- **International references:** [Scamwatch scam types](https://www.scamwatch.gov.au/types-of-scams),
  [Scamwatch response guidance](https://www.scamwatch.gov.au/stop-check-protect/what-to-do-if-youve-been-scammed)
  and [FTC consumer guidance](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed).
  General protective advice is adapted and labelled; foreign legal rights and
  reporting procedures are not presented as Indian remedies. CFPB complaint data
  and the FTC Consumer Sentinel Data Book were researched references, not imported
  victim-record datasets. See `data/sources.json` for provenance and usage.
- **AI-assisted development and review:** ChatGPT assisted research, synthetic
  examples, implementation, tests and documentation. The team reports additional
  reviews from ChatGPT Go, Gemini Pro, Claude and Google AI Studio. This disclosure
  does not imply every recommendation was implemented or independently verified.
  No runtime AI model, paid AI API or trained fraud classifier is used.

### Pre-existing work and event-day development

**Prepared before the event:** the Fraud First Aid Database v1 pack and prototype
v0.1.1 (`ac07862`), including its Flask/vanilla-JavaScript architecture, checklist,
export, synthetic scenarios, tests and documentation. These are disclosed
pre-existing team assets. The organizer's approval of prework is recorded from the
team's confirmation; the team should retain the original permission message.

**Event-day candidate work, October 28, 2026:** v0.1.2-rc1 (`546bc2e`) applies two
JavaScript error-display fixes, clarifies A01/A04/A10 guidance, adds a supplementary
source reference and focused acceptance tests, and records regression evidence.
Routing rules, frameworks and dependencies were not changed. See `docs/UPDATE.md`
and `docs/GUIDANCE_CHANGES.md` for the bounded changes. This candidate is an
extension of the pre-existing prototype, not a claim that the entire app was
created during the hackathon window.

The examples are synthetic, not real complaints. Public statistics provide
context, not evidence that an individual action will recover funds. Source
attribution is not a claim of official endorsement or unrestricted licensing.
The real Windows candidate walkthrough and independent human guidance review
remain pending; v0.1.1 remains the stable baseline.

## Windows quick start (PowerShell)

Extract the ZIP first. Open PowerShell in the extracted `fraud-first-aid` folder.
Alternatively, double-click `start_windows.bat` (Python launcher `py` required).
The convenience launcher has not been executed on Windows here; the manual
commands below are the fallback.

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Open **http://127.0.0.1:5000** in a browser. Keep the terminal running.
Stop with Ctrl+C. Do not open index.html directly.
No environment activation or API key is needed.
If `py` is unavailable, try `python` after installing Python 3.10 or later.
If port 5000 is occupied: `$env:PORT="5001"` then run app.py and open port 5001.

## macOS / Linux

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python app.py
```

## Tests

On Windows, double-click `check_windows.bat` after setup. It runs the Python suite
and database regression cases; if Node.js is installed it also runs controller
unit tests. Missing Node is explicitly reported as skipped, not passed. Node is
not required to use the app.

Cross-platform full available check: `python self_check.py` using your virtual
environment's Python. Controller-only: `node --test tests/frontend.test.cjs`.

Windows: `.\.venv\Scripts\python.exe -m unittest discover -s tests -v`

macOS / Linux: `.venv/bin/python -m unittest discover -s tests -v`

The tests check requirements and API behavior; they do not establish legal
correctness, independent human review or model accuracy. See docs/VERIFICATION.md.

## Demo in 90 seconds

1. Show urgent reporting options before the form.
2. Load the fictional Deceived UPI payment example: INR 4500, suspected fraud yes,
   money moved yes, credentials no, remote access no, both reporting answers no.
3. Show the bank-contact source and the limits on liability/refund claims.
4. Mark ONLY Organise incident facts (A06) done.
5. Reveal that the seller requested screen sharing. Change remote access to Yes.
6. Confirm A05 device guidance appears incomplete and A06 remains done.
7. Add the screen-sharing fact to optional notes, download and inspect the summary.
8. Explain that nothing was submitted and recovery is not guaranteed.

Do not switch to a different scenario or mark every action done during this demo.

## Team ownership

- Integration owner: frontend/static files, main branch and release ZIP.
- Backend owner: engine.py, app.py, API tests; preserve the documented contract.
- Review/demo owner: sources, acceptance walkthrough, README, demo and submission.

One editor per file at a time. Give other AIs current files and bounded tasks.
Do not merge an entire alternative app over the working version.

## Files

- `app.py`: HTTP endpoints and local server.
- `engine.py`: validation, routing, completion tokens and export.
- `static/`: browser interface; no external JS/CSS dependencies.
- `data/`: database v1 JSON exports with candidate action-wording and source updates;
  routing rules and synthetic-case expectations remain unchanged.
- `tests/`: hand-authored acceptance and API checks.
- `docs/`: requirements, verification, team handoff and source review.

Only questions, actions, rules and sources are loaded at runtime. The SQLite file
remains in your previously shared database pack. Statistics are not used to choose
a victim's next action. Synthetic examples are not actual complaints.

## Session privacy

Answers and optional details are sent to the Flask server to generate
the checklist and summary. The application does not persist incident
records. Hosting-provider logging is separate from application storage.
Refreshing or closing the page clears the interface state; downloaded
summaries remain on your device. Never enter passwords, PINs, OTPs
or full bank-account details.

## Git checkpoint on your laptop

```sh
git init
git add .
git commit -m "Working Fraud First Aid MVP v0.1"
```

Configure your own Git identity if prompted. A Git bundle of the development
checkpoint is included separately in the release for history restoration.

## Before tomorrow

Already running v0.1.0? Follow `docs/UPDATE.md`; keep your existing `.venv`.

Run on all three laptops, complete the manual checklist, review the pending
guidance, confirm event submission rules, and rehearse without internet after
dependencies are installed. Do not add features until these gates pass.
