# Deployment checklist — Fraud First Aid 2.1 review

**Do not use this review candidate for real financial-incident data without expert guidance, privacy, security and operational reviews.** No deployment or Git push was done during this release.

1. Test in Windows Command Prompt using `README.md` instructions.
2. Run `python self_check.py` and check all failures/skips. Test `/`, `/classic`, `/api/health` and all guided routes.
3. Confirm `data/questions.json`, `data/actions.json`, `data/routing_rules.json`, `data/sources.json` are nested under `data/` when committing to GitHub. Do not flatten folders.
4. Render: Python web service; build `pip install -r requirements.txt`; start `gunicorn --bind 0.0.0.0:$PORT app:app` (Gunicorn is for Linux deployment, not local Windows).
5. Real AI vision stays OFF until a server-side key/provider security review is complete. Tesseract is NOT preinstalled by the pip requirements; verify availability or keep local OCR disabled. No AI provider is necessary for manual intake.
6. Verify `GET /api/health`, the homepage, `/api/intake/options`, description suggestions, manual category flow, 1930 and bank resources, full report and `.ics` download. Reproduce changes from seven to eight actions and preserved A06 on the unmodified UPI example.
7. Source links and bank numbers must be checked on current official pages before going live. Note cold starts and third-party hosting log policies; do not claim no server processing.
8. Independently assess security controls including upload throttling, logging, CSP and abuse prevention. Prototype throttle is per-process, not a production-grade distributed system.

**If the deployed app fails:** use the preserved earlier release; no forced migrations or destructive database steps are required because this version has no incident database.
