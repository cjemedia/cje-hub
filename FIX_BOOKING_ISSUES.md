# Fix Booking Issues - Based on Logs

## Issues Found in Logs

### ✅ Issue 1: Emails ARE Working!
Both emails are being sent successfully:
- Client email: `messageId: '8c811c7e-7aab-4e12-bb70-655ebe5ad32d'`
- Admin email: `messageId: 'bd5078e4-c318-4b3d-9447-485ae5e23e2b'`

**Status:** ✅ FIXED - Emails are working!

### ❌ Issue 2: GOOGLE_REFRESH_TOKEN Not Set
**Error:** `GOOGLE_REFRESH_TOKEN not set - calendar events will fail`

**Fix:**
1. You need to set up Google OAuth and get a refresh token
2. Add to `.env.local`:
   ```
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

**How to Get Refresh Token:**
1. Follow the instructions in `BOOKING_SYSTEM_SETUP.md`
2. Or visit: `/api/auth/google` to start the OAuth flow
3. After authorizing, the refresh token will be logged in the console
4. Copy it to your `.env.local` file

### ❌ Issue 3: Database RLS Policy Blocking Bookings
**Error:** `new row violates row-level security policy for table "bookings"`

**Fix:**
I've updated the code to use the service client which bypasses RLS. But you also need:

1. **Add to `.env.local`:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Get Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the "service_role" key (NOT the anon key)
   - Add it to `.env.local`

3. **Alternative: Fix RLS Policy (if you prefer):**
   - Run the SQL in `supabase/fix-rls-policy.sql` in your Supabase SQL Editor
   - This allows public INSERTs on the bookings table

## Quick Fix Checklist

- [ ] Add `GOOGLE_REFRESH_TOKEN` to `.env.local`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Restart your dev server (`npm run dev`)
- [ ] Test a booking

## After Fixing

Once you've added both environment variables:
1. Restart your dev server
2. Try creating a booking
3. Check logs for:
   - ✅ `Calendar event created successfully`
   - ✅ `Client confirmation email sent successfully`
   - ✅ `Admin notification email sent successfully`
   - ✅ Booking saved to database (no RLS error)

