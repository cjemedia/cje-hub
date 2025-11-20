# CJE Hub Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Resend account and API key
- A Vercel account (for deployment)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your:
   - Project URL
   - Anon/public key
3. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL

## Step 3: Set Up Resend

1. Create a Resend account at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (optional but recommended)

## Step 4: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend
RESEND_API_KEY=your_resend_api_key
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First Client

1. Go to Supabase Dashboard > Authentication
2. Create a new user manually or enable email signup
3. The user will automatically get a client record when they first log in

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Subdomain Setup (agency.ciarajevans.com)

To set up the subdomain for the client portal:

1. In Vercel, go to your project settings
2. Add `agency.ciarajevans.com` as a domain
3. Update DNS records as instructed by Vercel
4. The `/hub` routes will be accessible at `agency.ciarajevans.com`

Alternatively, you can:
- Create a separate Vercel project for the subdomain
- Use Vercel's rewrites to route `agency.ciarajevans.com` to `/hub` routes

## Features Implemented

### Main Site (ciarajevans.com)
- ✅ Home page with hero, about, and contact sections
- ✅ Services page (CJE Experiences first, then CJE Media, then Custom)
- ✅ Booking page
- ✅ Responsive navigation
- ✅ Email integration via Resend

### Client Portal (CJE Hub)
- ✅ Authentication with Supabase
- ✅ Dashboard with stats
- ✅ Project management
- ✅ Booking system (meetings & content shoots)
- ✅ Events hub (CJE Experiences)
- ✅ Deliverables management

## Next Steps

1. Add actual client data to Supabase
2. Upload project deliverables
3. Create events in the events table
4. Customize branding and content
5. Set up payment integration (Stripe) if needed
6. Add analytics tracking

## Support

For issues or questions, contact: media@ciarajevans.com

