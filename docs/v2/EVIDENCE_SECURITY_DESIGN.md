# Evidence analysis boundary — DESIGN ONLY

Current build accepts no user image. Fictional demo uses a bundled image and hand-authored proposed facts, with explicit disclosure and confirmation. No provider is configured or called.

## Proposed next-phase pipeline
1. Client allows JPEG/PNG only; start with 1 image, max 5 MiB, max 16 megapixels. Reject SVG, PDF, GIF, HEIC and all other formats explicitly. These are proposed limits, not currently enabled capabilities.
2. Show local preview and privacy review. User draws solid redaction rectangles; flatten/redraw to a new raster. Preview exactly the sanitized raster that would leave the device. Original bytes never included in transmission.
3. Explicit unchecked consent names the selected provider, purpose, fields transmitted, relevant retention policy, and an alternative manual route. Do not promise provider zero retention without verified account-specific configuration. Changing image/redaction invalidates consent.
4. A separate bounded multipart endpoint validates size (reverse proxy + Flask), MIME, magic bytes, full decode, dimensions and decompression limits using a maintained decoder; strips metadata and re-encodes a raster. Filename/extensions and client validation are untrusted. Reject malformed/polyglot/truncated inputs and excessive dimensions.
5. Provider key only in server environment. Rate/concurrency limits, request timeout, bounded retries, cost cap, kill switch and origin/CSRF strategy for the eventual auth/session model. Existing 16 KiB JSON endpoints stay unchanged; do not relax global limits to enable uploads.
6. No app logs of bodies, extracted text, secrets, raw images or provider responses. Restrict error reporting and host/proxy tracing. Ephemeral memory with bounded lifetime; any unavoidable temporary file is private and deleted in finally paths including errors. Document provider retention separately.
7. Fixed structured schema: observations [{field, value, evidence_excerpt}], proposed_facts with enum-validated eight-fact subset, uncertainty[], possible_warning_signs[]. Reject unknown keys, invalid types, excessive text and unsupported claims. No tool execution, URL fetching, complaint submission or bank actions by the model.
8. Treat image text, OCR and model output as data. Instructions embedded in images must never override the system/schema. Render using textContent; no HTML injection. Do not offer numerical fraud certainty without validated calibration.
9. Per-field user correction/confirmation before any proposed fact reaches the rule engine. An empty or unreadable extraction falls back to manual intake. No finding of fraud or recovery guarantee.

## Mandatory tests before enabling real uploads
Fictional PNG/JPEG success; wrong extension/magic; corrupt/truncated images; EXIF removal; oversized body/dimensions; decompression bomb; redaction persistence in transmitted bytes; consent absent/revoked; changed image invalidates consent; provider unavailable/timeout; malformed JSON/enums; prompt injection in pixels; secret-exfiltration bait; output XSS; rate limit; logs redacted; temporary cleanup; original bytes absent from outbound requests; correction/confirmation; no public storage URLs.

## Risks remaining in first delivery
Guidance remains review-pending. A successful test proves implemented routing, not correctness of legal/financial guidance. External Maps/bank links remain third-party services in the classic UI. The new UI sends confirmed facts/optional notes to Flask only after review; host logging still requires operator verification. Browser refresh clears in-memory state; downloaded summaries persist on the device. Source freshness must be reviewed before production release.
