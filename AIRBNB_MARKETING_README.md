# Airbnb Marketing Portal — Setup

This package adds an Airbnb Marketing client portal to CJE Hub.

## What's Included

**New routes:**
- `/airbnb-marketing` — Public, password-protected landing page with Property Vision Form
- `/admin/marketing-inquiries` — Admin list of submitted inquiries
- `/admin/marketing-inquiries/[id]` — Admin detail view + amount input + payment link sender

**API routes:**
- `POST /api/marketing-inquiries/verify-password` — Password gate check
- `POST /api/marketing-inquiries` — Form submission (saves to DB, emails Ciara)
- `POST /api/marketing-inquiries/[id]/send-payment` — Creates Stripe Payment Link, emails client
- `POST /api/marketing-inquiries/[id]/mark-paid` — Manual mark as paid (no webhook needed)

**Database:**
- New table: `marketing_inquiries` with status workflow (new → payment_sent → paid → completed)

## Setup

The `airbnb-marketing-setup.sh` script handles the AdminSidebar edit automatically.
You still need to do the SQL migration and env vars yourself:

### 1. Run SQL migration
- Open Supabase dashboard → SQL Editor → New Query
- Paste contents of `supabase/marketing-inquiries-migration.sql`
- Run

### 2. Add env vars
Add to `.env.local`:
```
AIRBNB_MARKETING_PASSWORD=spring2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add to Vercel (Production AND Preview environments):
```
AIRBNB_MARKETING_PASSWORD=spring2026
NEXT_PUBLIC_APP_URL=https://ciarajevans.com
```

These should already exist from other features:
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## How it works

**Client flow:**
1. Ciara sends client the password + URL
2. Client unlocks the page, fills out Property Vision Form, submits
3. Form data goes to Supabase, Ciara gets notification email
4. Client sees Thank You message saying deposit link is coming via email

**Ciara flow (in CJE Hub):**
1. Sidebar → "Airbnb Inquiries"
2. Click into the new submission
3. Type the amount (defaults to $350) → click "Create & Send"
4. Stripe Payment Link is created and emailed to the client
5. When client pays, Stripe sends Ciara a notification email
6. Ciara comes back to the inquiry → clicks "Mark as Paid"
7. After delivering the reels → "Mark Completed"

## v2 ideas (not in this drop)

- Stripe webhook to auto-mark paid (skips the manual step)
- Per-client passwords or magic links instead of one shared password
- Resend the payment link from inside the admin view
- Automated reminder email if payment link not used within 24h

## Color reference

- Black: `#0a0a0a`
- Tiffany: `#0ABAB5`
- Paper: `#fafaf7`
- Fonts: Montserrat (body), Allura (script accents)
