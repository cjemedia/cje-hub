import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback` : 'http://localhost:3000/api/auth/google/callback'
)

// Set credentials from environment (refresh token stored in env)
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
} else {
  console.warn('GOOGLE_REFRESH_TOKEN not set - calendar events will fail')
}

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// Generate time slots for a day (9am - 5pm, 30-minute intervals)
function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date()
      time.setHours(hour, minute, 0, 0)
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      slots.push(timeString)
    }
  }
  return slots
}

// Get available time slots for a specific date
export async function getAvailableSlots(date: string, isAdmin: boolean = false): Promise<string[]> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      throw new Error('GOOGLE_CALENDAR_ID not configured')
    }

    // Parse date and create time range in America/Chicago timezone
    const [year, month, day] = date.split('-').map(Number)
    
    // Create start and end of day in America/Chicago timezone
    // Format: YYYY-MM-DDTHH:mm:ss (will be interpreted as local, then we specify timezone)
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`)
    const endDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59`)

    // Get all events for the day (Google Calendar API handles timezone conversion)
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'America/Chicago',
    })

    const events = response.data.items || []
    const allSlots = generateTimeSlots()
    const bookedSlots = new Set<string>()

    // Mark slots as booked if they overlap with existing Google Calendar events
    events.forEach((event) => {
      let eventStart: Date | null = null
      let eventEnd: Date | null = null
      
      // Handle timed events (dateTime)
      if (event.start?.dateTime) {
        eventStart = new Date(event.start.dateTime)
        eventEnd = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(eventStart.getTime() + 45 * 60 * 1000)
      } 
      // Handle all-day events (date)
      else if (event.start?.date) {
        // All-day event blocks the entire day
        const allDayDate = new Date(event.start.date + 'T00:00:00')
        eventStart = allDayDate
        eventEnd = new Date(allDayDate)
        eventEnd.setHours(23, 59, 59, 999)
      }
      
      if (!eventStart || !eventEnd) return
      
      // Get event times in America/Chicago timezone
      // Google Calendar API returns times in the calendar's timezone (America/Chicago)
      // We need to extract the local time components for comparison
      const eventStartCT = new Date(eventStart.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
      const eventEndCT = new Date(eventEnd.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
      
      // Get the date components in Chicago timezone to ensure we're comparing the same day
      const eventStartDate = new Date(eventStartCT.getFullYear(), eventStartCT.getMonth(), eventStartCT.getDate())
      const selectedDate = new Date(year, month - 1, day)
      
      // Only process events that fall on the selected date
      if (eventStartDate.getTime() !== selectedDate.getTime()) {
        return
      }
      
      allSlots.forEach((slot) => {
        // Parse slot time (e.g., "9:00 AM")
        const [time, period] = slot.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        let slotHour = hours
        if (period === 'PM' && hours !== 12) slotHour += 12
        if (period === 'AM' && hours === 12) slotHour = 0
        
        // Create slot time in America/Chicago timezone for the selected date
        const slotTime = new Date(year, month - 1, day, slotHour, minutes, 0)
        const slotEnd = new Date(slotTime.getTime() + 45 * 60 * 1000) // 45-minute slot
        
        // Check if slot overlaps with event
        // Two ranges overlap if: start1 < end2 && start2 < end1
        if (slotTime < eventEndCT && slotEnd > eventStartCT) {
          bookedSlots.add(slot)
        }
      })
    })

    // Also check Supabase events table for events on this date
    try {
      const supabase = await createClient()
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      // Query events that fall on this date (date field contains full timestamp)
      const { data: supabaseEvents } = await supabase
        .from('events')
        .select('date, end_time')
        .eq('status', 'approved')
        .gte('date', `${dateStr}T00:00:00`)
        .lt('date', `${dateStr}T23:59:59`)

      if (supabaseEvents && supabaseEvents.length > 0) {
        supabaseEvents.forEach((event) => {
          const eventDate = new Date(event.date)
          // Convert to America/Chicago timezone
          const eventStartCT = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
          
          // Calculate end time - use end_time if available, otherwise default to 2 hours
          let eventEndCT: Date
          if (event.end_time) {
            const [endHours, endMinutes] = event.end_time.split(':').map(Number)
            eventEndCT = new Date(eventDate)
            eventEndCT.setHours(endHours, endMinutes, 0, 0)
            eventEndCT = new Date(eventEndCT.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
          } else {
            // Default to 2 hours if no end_time
            eventEndCT = new Date(eventStartCT.getTime() + 2 * 60 * 60 * 1000)
          }
          
          allSlots.forEach((slot) => {
            // Parse slot time (e.g., "9:00 AM")
            const [time, period] = slot.split(' ')
            const [hours, minutes] = time.split(':').map(Number)
            let slotHour = hours
            if (period === 'PM' && hours !== 12) slotHour += 12
            if (period === 'AM' && hours === 12) slotHour = 0
            
            // Create slot time in America/Chicago timezone for the selected date
            const slotTimeStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(slotHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
            const slotTime = new Date(slotTimeStr)
            const slotTimeCT = new Date(slotTime.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
            const slotEndCT = new Date(slotTimeCT.getTime() + 45 * 60 * 1000) // 45-minute slot
            
            // Check if slot overlaps with event
            // Two ranges overlap if: start1 < end2 && start2 < end1
            if (slotTimeCT < eventEndCT && slotEndCT > eventStartCT) {
              bookedSlots.add(slot)
            }
          })
        })
      }
    } catch (error) {
      console.error('Error fetching Supabase events:', error)
      // Continue with Google Calendar events only if Supabase query fails
    }

    // Filter available slots
    let availableSlots = allSlots.filter((slot) => {
      // Skip if already booked
      if (bookedSlots.has(slot)) {
        return false
      }
      return true
    })

    // Check if admin request - bypass 12-hour and buffer rules
    if (!isAdmin) {
      // Filter out slots within 12 hours (only for non-admin)
      const now = new Date()
      const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      
      availableSlots = availableSlots.filter((slot) => {
        // Check if slot is within 12 hours (for today only)
        const [time, period] = slot.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        let slotHour = hours
        if (period === 'PM' && hours !== 12) slotHour += 12
        if (period === 'AM' && hours === 12) slotHour = 0
        
        // Create slot time for comparison
        const slotTime = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(slotHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
        
        // If the date is today, check if slot is more than 12 hours away
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const selectedDateObj = new Date(date)
        selectedDateObj.setHours(0, 0, 0, 0)
        
        if (selectedDateObj.getTime() === today.getTime()) {
          // Same day - check if slot is more than 12 hours away
          if (slotTime <= twelveHoursFromNow) {
            return false
          }
        }
        
        return true
      })
    }
    
    return availableSlots
  } catch (error) {
    console.error('❌ Error fetching available slots:', error)
    // Return empty array if there's an error (fail closed - safer than showing unavailable times)
    // This prevents double-booking
    return []
  }
}

// Create a calendar event for a booking
export async function createCalendarEvent(booking: {
  name: string
  email: string
  date: string
  time: string
  type: string
  notes?: string
}) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      console.error('GOOGLE_CALENDAR_ID not configured')
      throw new Error('GOOGLE_CALENDAR_ID not configured')
    }
    
    // Check if we have a refresh token
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.error('GOOGLE_REFRESH_TOKEN not configured')
      throw new Error('GOOGLE_REFRESH_TOKEN not configured')
    }
    
    // Refresh access token if needed
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)
    } catch (tokenError: any) {
      console.error('Error refreshing access token:', {
        message: tokenError?.message,
        code: tokenError?.code,
      })
      throw new Error('Failed to authenticate with Google Calendar. Please check your refresh token.')
    }

    // Parse date and time - interpret as America/Chicago timezone
    // This ensures the booking time is always correct regardless of server or user timezone
    const [time, period] = booking.time.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    let hour = hours
    if (period === 'PM' && hours !== 12) hour += 12
    if (period === 'AM' && hours === 12) hour = 0

    // Parse date string (YYYY-MM-DD)
    const [year, month, day] = booking.date.split('-').map(Number)
    
    // Format date/time as ISO string in America/Chicago timezone
    // Google Calendar API will interpret this correctly when we specify timeZone: 'America/Chicago'
    // Format: YYYY-MM-DDTHH:mm:ss-06:00 (America/Chicago is UTC-6 standard time, UTC-5 during DST)
    // Google Calendar will handle DST automatically when timeZone is specified
    const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    
    // Calculate end time (45 minutes later)
    let endHour = hour
    let endMinute = minutes + 45
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60)
      endMinute = endMinute % 60
    }
    if (endHour >= 24) {
      endHour = endHour % 24
    }
    
    // Format end time string
    const endDateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`
    
    // Format for Google Calendar API with America/Chicago timezone
    // Using UTC-6 offset (Google Calendar will handle DST automatically based on the date)
    const startDateTimeISO = `${dateTimeString}-06:00`
    const endDateTimeISO = `${endDateTimeString}-06:00`

    // Determine attendees based on inquiry type
    // For website/portal/tools bookings, include tech-support@ciarajevans.com
    // Note: booking@ciarajevans.com is NOT added as an attendee (only used for email sending)
    const techSupportTypes = ['Custom Website', 'Client Portal', 'Business Tools']
    const requiresTechSupport = techSupportTypes.includes(booking.type)
    
    const attendees = [
      { email: booking.email }, // Client email
      { email: 'media@ciarajevans.com' }, // Ciara's email
    ]
    
    // Add tech-support for website/portal/tools bookings
    if (requiresTechSupport) {
      attendees.push({ email: 'tech-support@ciarajevans.com' })
    }

    const event = {
      summary: `${booking.type} - ${booking.name}`,
      description: `Booking with ${booking.name}\n\nEmail: ${booking.email}\nType: ${booking.type}${booking.notes ? `\nNotes: ${booking.notes}` : ''}`,
      start: {
        dateTime: startDateTimeISO,
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: endDateTimeISO,
        timeZone: 'America/Chicago',
      },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 }, // 15 minutes before
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all', // Send calendar invites
      conferenceDataVersion: 1,
    })

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      hangoutLink: response.data.hangoutLink,
    }
  } catch (error: any) {
    console.error('Error creating calendar event:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

