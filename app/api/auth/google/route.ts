import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// This is a one-time setup route to get the refresh token
// After running this once and getting the refresh token, store it in .env.local as GOOGLE_REFRESH_TOKEN

export async function GET(request: NextRequest) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
  )

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to get refresh token
  })

  return NextResponse.redirect(authUrl)
}

