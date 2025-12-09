import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Callback route to handle OAuth response
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // IMPORTANT: Store this refresh_token in your .env.local file as GOOGLE_REFRESH_TOKEN
    return NextResponse.json({
      message: 'Authorization successful!',
      refresh_token: tokens.refresh_token,
      instructions: 'Add this refresh_token to your .env.local file as GOOGLE_REFRESH_TOKEN',
    })
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500 }
    )
  }
}

