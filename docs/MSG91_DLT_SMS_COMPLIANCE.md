# MSG91 DLT / SMS Compliance Checklist

This checklist helps you prepare SMS templates, sender IDs, opt-in language, and throttling rules required for DLT and telecom compliance when using MSG91 in India.

1. Registration & Account

- Ensure your business is registered on the national DLT portal and linked to the MSG91 account.
- Obtain a registered Sender ID (6-character alphanumeric) via MSG91 — keep mapping of Sender ID → campaign.

2. Templates (DLT Templates)

- Create explicit templates for each message type (OTP, Transactional, Promotional).
- Template fields should be parameterized (e.g., {OTP}, {CODE}, {BRAND}).
- Persist the DLT Template IDs and use them in API calls to MSG91 where required.
- Keep a changelog for template updates and re-register on DLT as needed.

3. Message Content & Opt-in

- OTP messages: short, include purpose and brand. Example: "Your KULTUR OTP is {OTP}. Do not share this with anyone. - KULTUR"
- Transactional messages (vouchers/rewards): include campaign name and a short T&C link.
- Always include opt-in confirmation language at first consent capture: "By submitting your number, you agree to receive SMS from {BRAND} about campaign offers." Store timestamp and DLT consent record.
- Record consent source (QR scan), timestamp, and consent version in the `leads` table.

4. Sender ID & Campaign Mapping

- Map each active campaign to a Sender ID and DLT template set.
- Limit Sender ID reuse across unrelated campaigns to minimize blocking.

5. Throttling & Anti-Abuse

- Enforce per-phone OTP limits (e.g., max 3 sends/hour) in DB and logic (already implemented in RPCs).
- Implement global and per-IP rate limits (e.g., 20 claim starts/hour per IP).
- Monitor bounce/backlist reports; suspend sending to affected numbers immediately.

6. Opt-out & Data Retention

- Honor STOP/UNSUBSCRIBE if applicable for promotional messages; maintain suppression list.
- Retain SMS logs and consent proof for at least 1 year (or per regulation); rotate/archive securely.

7. Monitoring & Reporting

- Log MSG91 API responses and delivery receipts to a secure audit store.
- Alert on spikes of failed deliveries, increased OTP fails, or sudden supplier errors.

8. Security

- Use MSG91 credentials securely (do not store service keys in client code). Use server-only secrets and role-based access.
- Rate-limit APIs that call MSG91 to avoid accidental overuse.

9. Testing & Go-Live

- Test each DLT template in pre-prod with small traffic and verify delivery and formatting.
- Verify Sender ID display across major carriers and handset types.

10. Legal / Privacy

- Ensure opt-in language and TOS are available on the public claim page and retained with each lead record.
- Validate that marketing consent is explicit and can be revoked.

Notes

- This is a suggested checklist — coordinate with your telecom partner and MSG91 onboarding team for their specific DLT steps.
