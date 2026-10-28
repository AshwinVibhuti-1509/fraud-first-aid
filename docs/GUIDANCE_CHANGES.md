# Candidate guidance changes — human review pending

## A01

Before: Report a suspected fraudulent bank transaction immediately. Obtain an acknowledgement.

After: Report the suspected fraudulent transaction to your bank promptly through its genuine app or official contact details, and obtain an acknowledgement. Explain whether you made the payment yourself. This prototype does not determine refund eligibility or liability, including for payments authorised after deception.

## A04

Before: Use the provider’s genuine recovery process. If you can still sign in, replace exposed passwords, including reused passwords, and enable two-factor authentication where available.

After: For an exposed password, use the account provider’s genuine recovery process; replace exposed or reused passwords and enable two-factor authentication where available. If banking account credentials, a banking PIN or an OTP were exposed, promptly contact the affected bank or payment provider through its genuine app or official website, even if no financial loss is yet known. Ask how to secure the affected access. This banking step applies only if banking or payment access was involved. Banking-contact reference: https://cyber.delhipolice.gov.in/vishing.html

## A10

Before: Confirm what money moved, which payment channel was involved and whether account access was exposed. Unknown answers must remain unknown.

After: Keep uncertain answers as unknown. Confirm which payment channel was involved and whether account access was exposed. If you discover a debit you do not recognise, promptly contact your bank through its genuine app or official contact details to verify it; do not wait to complete this form. A pending payment alone does not establish fraud.

Sources checked 28 October 2026: RBI SMS customer liability page (S02), FTC What To Do if You Were Scammed (S05), and https://cyber.delhipolice.gov.in/vishing.html.

Banking-contact/no-known-loss wording is a conditional adaptation of Delhi Police advice to inform the bank about credential-seeking contacts. Provider wording is a general protective adaptation, not a regulatory obligation. The extra banking reference is included explicitly in A04 text and therefore its export, preserving all JSON field contracts and avoiding unrelated frontend changes. FTC remains the linked source for password recovery and general protective advice.

A01 liability language is a product limitation, not an RBI quotation. A10 verification wording is a cautious workflow adaptation. No refund entitlement, deadline or OTP-reset instruction is added. All original review-pending status values remain unchanged.

Routing and selected action IDs are unchanged. Unknown/no-loss exposure still selects A04 without A01; the relevant conditional banking instruction is now in A04. Non-India still selects A12 only.
