# Official portal evidence, links, limitations — reviewed 1 Nov 2026

Sources are official government pages. Live contents can change; users must verify the current form when filing.

1. **National Cyber Crime Reporting Portal**: https://cybercrime.gov.in/ — official reporting access and 1930 for suspected financial cyberfraud.
2. **Official complaint preparation checklist**: https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx — requires incident date/time, narrative (currently 200+ chars with some special-character restrictions), an identity document submitted to the **official** portal (not this app), and for financial incidents the bank/wallet/merchant, transaction ID/UTR, date and amount, and supporting evidence. This app helps prepare the other details, but does not collect national-ID scans.
3. **Track your Complaint**: https://cybercrime.gov.in/webform/chkackstatus.aspx — official tracking, with acknowledgement and authentication handled by the official site. If a direct link fails, start from https://cybercrime.gov.in/ and select Track your Complaint. No official status is imported here.
4. **Official State/UT grievance officer directory**: https://cybercrime.gov.in/webform/Crime_NodalGrivanceList.aspx — official site says a complainant using Report & Track *may contact* their State/UT nodal/grievance officer if the response has not been appropriate. Contact details can change; do not hard-code named officials or claim guaranteed eligibility.
5. **Government suspect identifier repository**: https://cybercrime.gov.in/webform/suspect_search_repository.aspx — search mobile, email, bank account, social media or UPI identifiers. Its disclaimer says entries are complaint-derived, not certified as authentic, and the database is incomplete. Do not present hits as verified guilt or missing results as proof of safety.
6. **Government website/app suspect lookup**: https://cybercrime.gov.in/Webform/suspect_search_websites.aspx — user navigates there directly to check relevant identifier.
7. **Official FAQ**: https://cybercrime.gov.in/Webform/FAQ.aspx — describes evidence types and complaints handled by concerned State/UT police.

**Design decision:** Government complaint authentication relies on OTP/CAPTCHA and official site login. Fraud First Aid intentionally links to the official site rather than scraping status, pretending to query it, or storing government credentials. User-entered status is a *personal note*, not validation. Screenshot evidence is treated as user-supplied, not verified proof.
