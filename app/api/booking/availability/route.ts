import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Check if admin request - bypass 12-hour and buffer rules
    const isAdmin = searchParams.get('isAdmin') === 'true'

    // Check if date is in the past (only for non-admin)
    if (!isAdmin) {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        return NextResponse.json(
          { error: 'Cannot book dates in the past' },
          { status: 400 }
        )
      }
    }

    // Get available slots
    const availableSlots = await getAvailableSlots(date, isAdmin)

    return NextResponse.json({
      date,
      availableSlots,
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

