import { NextRequest, NextResponse } from 'next/server'
import { calendar } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

// Test endpoint to check calendar connection
export async function GET(request: NextRequest) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    
    if (!calendarId) {
      return NextResponse.json({
        error: 'GOOGLE_CALENDAR_ID not configured',
        configured: false,
      }, { status: 500 })
    }

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json({
        error: 'GOOGLE_REFRESH_TOKEN not configured',
        configured: false,
      }, { status: 500 })
    }

    // Try to list calendars to test connection
    const response = await calendar.calendarList.list()
    
    return NextResponse.json({
      success: true,
      calendarId,
      calendars: response.data.items?.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary,
      })),
      message: 'Calendar connection successful',
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Calendar connection failed',
      message: error?.message,
      code: error?.code,
      details: error?.response?.data || error,
    }, { status: 500 })
  }
}

