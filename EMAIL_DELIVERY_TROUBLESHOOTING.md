# Email Delivery Troubleshooting

## Issue: Resend shows email sent but client doesn't receive it

### Common Causes:

1. **Email in Spam/Junk Folder**
   - Ask client to check spam/junk folder
   - Common for transactional emails from `noreply@` addresses

2. **Domain Authentication Not Set Up**
   - Verify domain in Resend dashboard
   - Set up SPF, DKIM, and DMARC records
   - Go to Resend → Domains → Add Domain
   - Follow DNS setup instructions

3. **Email Provider Blocking**
   - Some providers (Gmail, Outlook) may block emails from unverified domains
   - Check Resend dashboard for bounce/spam reports

4. **Email Address Typo**
   - Verify the email address in the booking form
   - Check server logs for the exact email sent

### Steps to Fix:

1. **Verify Domain in Resend:**
   - Log into Resend dashboard
   - Go to Domains
   - Add `ciarajevans.com` if not already added
   - Add the required DNS records (SPF, DKIM, DMARC)
   - Wait for verification (can take up to 48 hours)

2. **Check Resend Logs:**
   - Go to Resend → Emails
   - Find the email that was sent
   - Check status: Delivered, Bounced, or Failed
   - Check bounce reason if available

3. **Test with Different Email:**
   - Try sending to a Gmail address
   - Try sending to a different email provider
   - This helps identify if it's provider-specific

4. **Use Verified "From" Address:**
   - Consider using `media@ciarajevans.com` instead of `noreply@ciarajevans.com`
   - Verified addresses have better deliverability
   - Update in `app/api/booking/create/route.ts` if needed

5. **Add Plain Text Version:**
   - Some email clients prefer plain text
   - Can improve deliverability

### Current Configuration:

- **From Address:** `The CJE Experience <media@ciarajevans.com>`
- **Reply-To:** `media@ciarajevans.com`
- **Email Service:** Resend

### Quick Checks:

1. ✅ Is `ciarajevans.com` verified in Resend?
2. ✅ Are SPF/DKIM/DMARC records set up?
3. ✅ Is the email address correct in the booking form?
4. ✅ Check spam folder
5. ✅ Check Resend email logs for bounce reasons

### If Still Not Working:

1. Check Resend dashboard for detailed error messages
2. Try sending a test email from Resend dashboard directly
3. Contact Resend support with the message ID from logs
4. Consider using a different "from" address that's verified

