# How to View Logs

## Local Development

If you're running the app locally with `npm run dev`:

1. **Terminal/Console** - The logs appear directly in the terminal where you ran `npm run dev`
   - Look for messages like:
     - `✅ Calendar event created successfully`
     - `❌ Error creating calendar event`
     - `✅ Client confirmation email sent successfully`
     - `❌ Failed to send client confirmation email`

2. **Browser Console** - For client-side errors:
   - Open browser DevTools (F12 or Cmd+Option+I)
   - Go to the "Console" tab
   - Look for any error messages

## Production (Vercel)

If your app is deployed on Vercel:

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in
2. Select your project (CJEHub)
3. Click on the **"Deployments"** tab
4. Click on the latest deployment
5. Click on the **"Functions"** tab
6. Click on the function you want to check (e.g., `/api/booking/create`)
7. Scroll down to see the **"Logs"** section
8. Look for the log messages with timestamps

### Option 2: Vercel CLI

1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel@latest
   ```

2. View logs in real-time:
   ```bash
   vercel logs --follow
   ```

3. View logs for a specific function:
   ```bash
   vercel logs /api/booking/create --follow
   ```

4. View logs for a specific deployment:
   ```bash
   vercel logs [deployment-url] --follow
   ```

### Option 3: Vercel Dashboard - Real-time Logs

1. Go to your project in Vercel dashboard
2. Click on **"Logs"** in the left sidebar
3. You'll see real-time logs from all functions
4. Filter by function name or search for specific terms

## What to Look For

When a booking is created, you should see logs like:

### Success Logs:
```
✅ Attempting to create calendar event...
✅ Calendar event created successfully: { eventId: '...', htmlLink: '...' }
✅ Attempting to send client confirmation email to: user@example.com
✅ Client confirmation email sent successfully to: user@example.com Message ID: re_...
✅ Attempting to send admin notification email to: media@ciarajevans.com
✅ Admin notification email sent successfully. Message ID: re_...
```

### Error Logs:
```
❌ Error creating calendar event: { message: '...', code: '...', details: {...} }
❌ Failed to send client confirmation email: { error: {...} }
❌ Error sending confirmation email: { message: '...', error: {...} }
```

## Common Issues to Check

1. **Calendar Event Not Created:**
   - Look for: `❌ Error creating calendar event`
   - Check: `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` environment variables
   - Error might say: "GOOGLE_REFRESH_TOKEN not configured" or "Failed to authenticate"

2. **Client Email Not Sent:**
   - Look for: `❌ Failed to send client confirmation email`
   - Check: `RESEND_API_KEY` environment variable
   - Check: Email address format is valid
   - Error might say: "Resend error" or "Email send error"

3. **Admin Email Not Sent:**
   - Look for: `❌ Failed to send admin notification email`
   - Same checks as client email

## Quick Test

To test if logging is working, create a test booking and immediately check the logs. You should see all the log messages appear in real-time.

## Need Help?

If you see error messages in the logs, copy the full error message (including the details) and share it so we can diagnose the specific issue.

