# Fraud First Aid — GitHub and Render Deployment

## What this is

A student prototype for post-incident financial-fraud response, built for the DECAcode 2026 hackathon by Wall Street Wolves. It is **not** a bank, government service, financial regulator, fraud-detection system, or complaint-submission service. Guidance is provisional and linked to external sources. **No reimbursement or recovery is guaranteed.** Use only fictional test inputs during hackathon demonstrations; do not enter PINs, passwords, OTPs, full account numbers, or actual confidential incident files. The app has no login or incident database; downloaded summaries persist on the user's device.

## Source code: GitHub

## Fastest upload to your existing GitHub repository

Repository: **https://github.com/AshwinVibhuti-1509/fraud-first-aid**

1. Extract the **ZIP** and open the extracted folder (the one containing `app.py`).
2. In the repository website, choose **Add file → Upload files** (for an empty repository use **uploading an existing file**).
3. Drag the **files and folders INSIDE** the extracted folder into the upload area. Do **not** upload the ZIP itself and do **not** nest everything in an extra `fraud-first-aid/` directory.
4. Confirm `app.py`, `engine.py`, `requirements.txt`, `render.yaml`, `Procfile`, `static/`, `data/`, `tests/`, and `docs/` appear at repository root; commit to `main`.
5. Render: **New → Web Service**, connect the repo, Python runtime, root blank, build `pip install -r requirements.txt`, start `gunicorn --bind 0.0.0.0:$PORT app:app`.
6. Verify the Render `/api/health` URL and walk through assessment, 7→8 actions, export, bank/Maps links and reset.

Never upload `.venv/`, `.git/`, any `.env` file, actual incident records, or downloaded incident summaries.


Create a repository called `fraud-first-aid` on GitHub and upload **the files inside this folder** to the repository root, or use Git:

```bash
git init
git add .
git commit -m "DECAcode 2026: Fraud First Aid demo"
git branch -M main
git remote add origin https://github.com/AshwinVibhuti-1509/fraud-first-aid.git
git push -u origin main
```

If using GitHub's browser upload, extract this ZIP, open the extracted folder containing `app.py` and drag **all contained files and subfolders**, not the ZIP itself, into `Add file` > `Upload files`. In particular `app.py`, `engine.py`, `requirements.txt`, `static/`, `data/` must all be at the repository root.

### Disclosure

The pre-event stable v0.1.1 prototype and dataset preparation predate the hackathon, with organizer permission as reported by the team. Event-day modifications are credited in `README.md` and `docs/`. AI assistance and third-party official guidance sources are acknowledged there.

## Publish: Render Web Service (Flask, not Static Site)

1. Open Render, sign in, `New` > `Web Service`.
2. Connect GitHub and select the repository.
3. Configure:
   - Language/runtime: **Python 3**
   - Root Directory: empty / repository root
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Plan: **Free** if offered. Check plan details before confirming any charges.
4. Create/deploy the service and inspect logs. After deployment, visit `https://YOUR-SERVICE.onrender.com/api/health` then the homepage.
5. Complete the 7->8-action fictional UPI demo, download, bank links, Maps links and reset on the PUBLIC URL before declaring it released.

The `render.yaml` Blueprint expresses the same configuration, but manual Web Service creation avoids unexpected plan/Blueprint UI issues. Keep automated deploys disabled during judging if necessary to avoid changes to the live build.

### Important caveats

- Free Render instances can spin down when inactive and take time to wake. Open the live site shortly before judging and keep the local Windows Flask demo as fallback.
- A public URL is not proof of professional security or regulatory vetting. Prototype only.
- Ordinary external bank links and Google Maps searches require internet access. Local checklist and exports don't need third-party APIs.
- You can use `python app.py` locally (Flask development server). Gunicorn is used **only** for the web deployment.
- Never commit real victim information, transcripts, passwords, `.env` files or downloaded incident summaries.
