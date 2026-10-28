# Guidance review log — 27 October 2026

Reopened and read these primary pages while building v0.1.0:

- RBI: https://www.rbi.org.in/commonman/english/Scripts/SMSLimitedliability.aspx
  Supports prompt bank notification and obtaining acknowledgement. The app does
  not calculate liability, compensation or guaranteed refund eligibility.
- MHA / PIB: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2287039&lang=1&reg=1
  Supports NCRP and 1930 as Indian cybercrime reporting assistance routes.
- FTC: https://consumer.ftc.gov/articles/what-do-if-you-were-scammed
  Supports provider contact, password replacement, two-factor authentication,
  account recovery and trusted device-security help as general protective advice.
- Scamwatch: https://www.scamwatch.gov.au/stop-check-protect/what-to-do-if-youve-been-scammed
  Supports stopping further payments and awareness of follow-up recovery scams.

RBI bank wording has narrower scope than every possible deceived payment; the
app offers bank contact without promising any particular remedy. FTC and
Scamwatch are foreign sources: only general advice is adapted. Their laws and
reporting contacts are not used as Indian remedies. The trusted-device phrase is
an implementation adaptation, not a direct quotation of the linked FTC page.

Unchanged data/actions.json and routing_rules.json retain team-review-pending
status. Source rereading is not legal or independent expert sign-off.

Team review needed:

- Confirm each paraphrase and adaptation is suitable for the six MVP situations.
- Check credential exposure involving PIN/OTP is sufficiently distinguished from
  password exposure before extending guidance. Current generic guidance is limited.
- Review whether unknown-suspicion cases need extra immediate protective actions;
  current rules remain unchanged and urgent reporting options stay visible.
- Test reporter-completion semantics with someone who did not build the app.
- Confirm whether additional categories need explicit unsupported messaging.

Do not add legal deadlines or liability calculations from memory. Treat a proposed
rule change as a documented product decision with tests, not a silent data edit.
