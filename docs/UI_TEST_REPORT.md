# UI integration test report — v0.1.2-rc1 + Gemini CSS (28 October 2026)

Tested in headless Chromium 141 against the running Flask app (desktop 1366×900 and mobile 390×844).
Real browser, real server. Not yet tested on the Windows presentation laptop or a physical phone.

## Result
Pass: questionnaire load, emergency banner, example loading, adaptive checklist, completion checkboxes,
remote-access change (A05 appears, only A06 stays done, progress 1 of 8), download
(fraud-first-aid-summary.txt, INR 4500.00, A06 DONE), reset (result hidden, answers/notes/amount cleared).
No JavaScript or console errors. No horizontal overflow at 390px or 1366px.
Existing checks still pass: 25 Python tests, 9 controller tests.

## CSS fixes (appended to static/style.css; nothing in the original rules was deleted)
- Sticky header could cover a keyboard-focused field: added scroll-padding-top.
- "+ Expand / − Collapse" chip wrapped onto two lines at 390px: no-wrap.
- Tap targets below 44px (source links, "Why this step?", Clear session, example selector/button,
  brand link) raised to 44px; checkboxes 22px to 24px (labels remain the large target).
- Added prefers-reduced-motion support.
- Mobile only: red "Call 1930" chip in the sticky header; the "STUDENT PROTOTYPE" pill is hidden under 450px to make room.

## Small additive changes (app.js and the backend are untouched)
- static/helpline.js (new): tel: links only dial on phones. On a laptop it copies the number and shows
  "Dial 1930 from your mobile". Phones are not intercepted.
- static/index.html: one extra script tag and one chip link in the header. Version label unchanged.

## Findings NOT fixed (JavaScript, preserved as instructed)
1. Editing Amount / Reference / Notes and then clicking "Download" immediately swallows that first click:
   leaving the field fires a change event (app.js line 56), which re-assesses and briefly disables the button.
   Demo workaround: click elsewhere (or press Tab), wait a second, then click Download.
2. Optional details start collapsed, so notes are hidden until the user expands them (by design).

## Not verified
Physical phone tel: behaviour, Windows laptop run, human guidance review.
