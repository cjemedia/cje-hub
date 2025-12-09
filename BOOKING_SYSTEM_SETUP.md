# Custom Booking System Setup Guide

## Overview

A custom booking system has been implemented with Google Calendar integration, email notifications, and Supabase storage. This replaces the previous Calendly integration.

## What's Been Implemented

### 1. Dependencies Installed
- `googleapis` - Google Calendar API integration
- `next-auth` - OAuth authentication (for Google setup)
- `@auth/core` - Core auth utilities

### 2. Files Created

#### Libraries
- `lib/google-calendar.ts` - Google Calendar utility functions
- `lib/email-templates.ts` - Branded email templates

#### API Routes
- `app/api/booking/availability/route.ts` - Get available time slots for a date
- `app/api/booking/create/route.ts` - Create a new booking
- `app/api/auth/google/route.ts` - OAuth initiation
- `app/api/auth/google/callback/route.ts` - OAuth callback

#### Pages
- `app/booking/page.tsx` - Completely rewritten booking page with new UI

#### Database
- `supabase/bookings-table.sql` - SQL script to create bookings table

### 3. Updated Files
- All booking links across the site now include `?type=` parameters
- Navigation, homepage, events, coaching, branding, partnerships, tools, and services pages updated

## Setup Instructions

### Step 1: Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar (required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=your_refresh_token_after_oauth_setup

# NextAuth URL (required for OAuth callback)
NEXTAUTH_URL=http://localhost:3000  # or your production URL

# Existing variables (should already be set)
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User type: External
   - Scopes: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`
6. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env.local`

### Step 3: Get Google Calendar ID

1. Go to [Google Calendar](https://calendar.google.com/)
2. Find the calendar you want to use for bookings
3. Go to **Settings** → **Settings for my calendars** → Select your calendar
4. Scroll to **Integrate calendar**
5. Copy the **Calendar ID** (usually `your-email@gmail.com` or `calendar-id@group.calendar.google.com`)
6. Add to `.env.local` as `GOOGLE_CALENDAR_ID`

### Step 4: Get Refresh Token (One-Time Setup)

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/auth/google`
3. You'll be redirected to Google to authorize the app
4. After authorization, you'll be redirected to the callback
5. The page will display your **refresh_token**
6. Copy this token and add it to `.env.local` as `GOOGLE_REFRESH_TOKEN`
7. **Important**: This is a one-time setup. The refresh token allows the app to access the calendar without user interaction.

### Step 5: Create Supabase Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open and run the contents of `supabase/bookings-table.sql`
4. The table will be created with all necessary columns and indexes

### Step 6: Test the System

1. Visit `/booking` on your site
2. Select an inquiry type
3. Choose a date (weekdays only)
4. Select an available time slot
5. Fill in your details
6. Submit the booking
7. Check:
   - Google Calendar for the new event
   - Your email for confirmation
   - Supabase `bookings` table for the record

## Booking Types

The system supports these inquiry types (via URL parameter `?type=`):

- `speaking` - Speaking Engagement
- `workshop` - Workshop / Training
- `hosting` - Event Hosting / Emcee
- `coaching` - 1:1 Coaching
- `accelerator` - Purpose Accelerator Cohort
- `website` - Custom Website
- `portal` - Client Portal
- `tools` - Business Tools
- `brand` - Brand Identity Consulting
- `creative` - Creative Direction
- `organization` - Organization / Corporate Inquiry

## Features

### Availability Checking
- Fetches real-time availability from Google Calendar
- Shows only available 30-minute slots between 9am-5pm
- Excludes weekends
- Prevents double-booking

### Email Notifications
- **Client confirmation email** - Sent to the person booking
- **Admin notification email** - Sent to `media@ciarajevans.com`
- Both emails use branded templates matching the site design

### Calendar Integration
- Creates Google Calendar events automatically
- Sends calendar invites to both client and admin
- Includes event details and notes
- Sets reminders (1 day before, 15 minutes before)

### Database Storage
- All bookings stored in Supabase
- Includes Google event ID for reference
- Tracks booking status
- Timestamps for audit trail

## Troubleshooting

### "Failed to fetch availability"
- Check `GOOGLE_CALENDAR_ID` is correct
- Verify `GOOGLE_REFRESH_TOKEN` is valid
- Ensure Google Calendar API is enabled

### "Failed to create booking"
- Check all environment variables are set
- Verify Supabase table exists
- Check Resend API key is valid
- Review server logs for specific errors

### OAuth not working
- Verify redirect URI matches exactly in Google Cloud Console
- Check `NEXTAUTH_URL` matches your domain
- Ensure OAuth consent screen is configured

## Production Deployment

1. Add all environment variables to Vercel (or your hosting platform)
2. Update `NEXTAUTH_URL` to your production domain
3. Add production redirect URI in Google Cloud Console
4. Test the booking flow in production
5. Monitor error logs for any issues

## Notes

- The system prevents booking past dates
- Weekends are automatically disabled
- Time slots are 30 minutes (9am-5pm)
- All bookings are stored with status "confirmed" by default
- Google Calendar events include both client and admin as attendees

