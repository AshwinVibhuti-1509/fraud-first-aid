# Security and privacy review (not a certification)

## Implemented safeguards

- No account, database, auto-save, or browser localStorage in the guided flow.
- No passwords, PINs, OTPs or CVVs solicited; warnings before intake and downloads.
- `textContent` to display dynamic text, no model-controlled HTML, and safe external link attributes.
- Screen-canvas opaque redaction, consent reset on every edit or image replacement, flattened PNG user preview.
- Server checks consent flags, strict file signature, 2 MiB bytes and 6 MP, decodes and re-encodes with Pillow (metadata stripped), does not save originals.
- Runtime provider keys remain in server environment. Real AI disabled when no key and feature flag.
- Request-size limits, no-store headers, same-origin restrictive CSP, no immediate complaint submission.
- Local OCR avoids third-party AI provider but still sends the selected image to the Flask host.
- User-provided exported strings are JSON-quoted to prevent line-forging while preserving Unicode.

## Known gaps / no production release

- Browser redaction cannot independently prove a user concealed all sensitive data. People must review the exact flattened preview.
- The optional vision provider adapter has not been tested with a live key; model outputs can be incomplete, inaccurate or contain unwanted data.
- Public hosting may log IPs, request sizes and operations. The app doesn't save incident payloads, but this does NOT establish zero retention by hosting or third-party AI services.
- Per-process upload rate limiting is insufficient on a multi-worker public service. Implement a distributed abuse limit, user protection and paid-API budget controls before enabling it publicly.
- The image analysis endpoint accepts PNG output from the canvas, not raw arbitrary uploads; client rasterizes JPEG before consent. CSRF/session protections and content policies require deployment review.
- Runtime update policies, professional financial-guidance review, independent accessibility review, legal/privacy compliance and incident-response procedures are not completed.
- For tests, use invented evidence only. Do not run real personal financial files through an unreviewed hosted instance.
