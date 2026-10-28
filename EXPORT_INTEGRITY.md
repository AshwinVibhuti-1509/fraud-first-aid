# Isolated export integrity patch — 28 October 2026

Base: v0.1.2-rc1 / 546bc2e. Branch: fix/export-user-text.
Not merged, not promoted. Stable v0.1.1 / ac07862 remains untouched.

## Correction

Only two lines in engine.py summary() change. Nonempty reference and notes fields
are rendered as labelled JSON-escaped strings using existing standard-library
json.dumps(..., ensure_ascii=True). This escapes CR, LF, tabs, other controls,
NEL, Unicode line/paragraph separators, quotes and backslashes. User input cannot
insert a new physical summary line through these fields. Input validation,
assessment, routing, action wording and completion-token generation are unchanged.

The preserved value is the existing validated value: validation already trims
leading/trailing whitespace, and this patch does not change that behavior. JSON
decoding the quoted export value recovers that value exactly. Unicode such as
the rupee symbol is represented with an escape; supplementary characters use
JSON surrogate-pair escapes. Empty fields retain the existing Not provided marker.

## Reproduction

Input notes: Ordinary user note + LF + DONE — Organise incident facts.
Input reference: REF-123 + CRLF + DONE — Contact your bank.
No checklist item was marked completed.

Before: two standalone DONE lines appeared inside user-supplied content.
After: zero standalone DONE lines; the injected text remains inside quoted,
escaped user-supplied fields. Actual checklist actions remain NOT MARKED DONE.
The package contains complete before/after text files and raw test output.

## Executed verification

- New regression suite reproduced the defect before the correction.
- 25 Python tests pass: all 22 existing tests plus three new export tests.
- Both notes and references tested with LF, CR, CRLF, VT, FF, FS, GS, RS,
  NEL (U+0085), line separator (U+2028) and paragraph separator (U+2029).
- Quoted text, literal backslash escapes and Unicode round-trip through JSON.
- 56 database regression scenarios pass without changing expected outputs.
- All 56 complete assessment responses, including tokens, exactly match the
  unmodified candidate. An injected-text assessment also matches exactly.
- All nine unchanged frontend controller tests pass.
- Existing exact INR 4500 demo test passes: only A06 completed, remote access
  adds incomplete A05, amount and export remain correct.
- API export with malicious multiline fields still has only the genuinely
  completed A06 status line.

## Application and remaining limits

Review export-integrity.patch and apply on top of v0.1.2-rc1. It changes only
engine.py, adds tests/test_export_integrity.py and this documentation file.
Do not overwrite separately owned frontend files or unrelated documentation.
Run self_check.py and inspect a real browser download after integrating.

Real Windows browser verification and human guidance review remain pending.
User text remains untrusted: deliberate manual edits to an exported text file
cannot be prevented. A consumer must not decode user fields and then mistake
their contents for application-generated status lines. No digital signing or
authentication of user-reported completion is claimed.

Target submission 13:30 IST; official freeze 14:00 IST, 28 October 2026.
