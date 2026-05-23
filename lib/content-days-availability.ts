/**
 * Content Days availability helper.
 *
 * This is intentionally separate from lib/google-calendar.ts so that
 * Ciara's regular consultation booking system (9am-5pm, weekdays)
 * stays untouched. Content Days has its own hours: 8 AM-7 PM,
 * Monday through Saturday.
 *
 * Both helpers share the same Google Calendar account and the same
 * Supabase events table for conflict detection.
 */

import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONTENT_DAYS_START_HOUR = 8   // 8 AM
const CONTENT_DAYS_END_HOUR = 19    // 7 PM (last slot starts at 6:30 PM)
const SLOT_MINUTES = 30             // 30-minute slot intervals
const SLOT_DURATION_MS = 30 * 60 * 1000
const BUFFER_MINUTES = 15           // 15-minute buffer around existing events
const MIN_HOURS_LEAD_TIME = 12      // No same-day-last-minute bookings

// ---------------------------------------------------------------------------
// OAuth2 client (reuses the same Google Calendar account as lib/google-calendar.ts)
// ---------------------------------------------------------------------------

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
    : 'http://localhost:3000/api/auth/google/callback'
)

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// ---------------------------------------------------------------------------
// Time slot generation
// ---------------------------------------------------------------------------

function generateContentDaysSlots(): string[] {
  const slots: string[] = []
  for (let hour = CONTENT_DAYS_START_HOUR; hour < CONTENT_DAYS_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const time = new Date()
      time.setHours(hour, minute, 0, 0)
      slots.push(
        time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
  }
  return slots
}

/**
 * Returns true if the given date string (YYYY-MM-DD) is a Sunday.
 * Content Days runs Monday-Saturday, so Sundays return zero slots.
 */
export function isSunday(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.getDay() === 0
}

// ---------------------------------------------------------------------------
// Main availability function
// ---------------------------------------------------------------------------

export async function getContentDaysAvailableSlots(date: string): Promise<string[]> {
  // No bookings on Sundays
  if (isSunday(date)) return []

  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      console.error('GOOGLE_CALENDAR_ID not configured')
      return []
    }

    const [year, month, day] = date.split('-').map(Number)
    const startDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`
    )
    const endDate = new Date(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59`
    )

    // Fetch existing Google Calendar events for the day
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'America/Chicago',
    })

    const events = response.data.items || []
    const allSlots = generateContentDaysSlots()
    const bookedSlots = new Set<string>()

    // Mark slots as booked if they overlap with existing Google Calendar events
    events.forEach((event) => {
      let eventStart: Date | null = null
      let eventEnd: Date | null = null

      if (event.start?.dateTime) {
        eventStart = new Date(event.start.dateTime)
        eventEnd = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : new Date(eventStart.getTime() + 45 * 60 * 1000)
      } else if (event.start?.date) {
        // All-day event blocks the whole day
        const allDayDate = new Date(event.start.date + 'T00:00:00')
        eventStart = allDayDate
        eventEnd = new Date(allDayDate)
        eventEnd.setHours(23, 59, 59, 999)
      }

      if (!eventStart || !eventEnd) return

      const eventStartCT = new Date(
        eventStart.toLocaleString('en-US', { timeZone: 'America/Chicago' })
      )
      const eventEndCT = new Date(
        eventEnd.toLocaleString('en-US', { timeZone: 'America/Chicago' })
      )

      const eventDateOnly = new Date(
        eventStartCT.getFullYear(),
        eventStartCT.getMonth(),
        eventStartCT.getDate()
      )
      const selectedDate = new Date(year, month - 1, day)

      if (eventDateOnly.getTime() !== selectedDate.getTime()) return

      allSlots.forEach((slot) => {
        const slotTime = slotStringToDate(slot, year, month, day)
        const slotEnd = new Date(slotTime.getTime() + SLOT_DURATION_MS)

        const bufferMs = BUFFER_MINUTES * 60 * 1000
        const bufferedEventStart = new Date(eventStartCT.getTime() - bufferMs)
        const bufferedEventEnd = new Date(eventEndCT.getTime() + bufferMs)

        if (slotTime < bufferedEventEnd && slotEnd > bufferedEventStart) {
          bookedSlots.add(slot)
        }
      })
    })

    // Also check Supabase events table for blocked time
    try {
      const supabase = await createClient()
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const { data: supabaseEvents } = await supabase
        .from('events')
        .select('date, end_time')
        .eq('status', 'approved')
        .gte('date', `${dateStr}T00:00:00`)
        .lt('date', `${dateStr}T23:59:59`)

      if (supabaseEvents && supabaseEvents.length > 0) {
        supabaseEvents.forEach((event) => {
          const eventDate = new Date(event.date)
          const eventStartCT = new Date(
            eventDate.toLocaleString('en-US', { timeZone: 'America/Chicago' })
          )

          let eventEndCT: Date
          if (event.end_time) {
            const [endHours, endMinutes] = event.end_time.split(':').map(Number)
            eventEndCT = new Date(eventDate)
            eventEndCT.setHours(endHours, endMinutes, 0, 0)
            eventEndCT = new Date(
              eventEndCT.toLocaleString('en-US', { timeZone: 'America/Chicago' })
            )
          } else {
            eventEndCT = new Date(eventStartCT.getTime() + 2 * 60 * 60 * 1000)
          }

          allSlots.forEach((slot) => {
            const slotTime = slotStringToDate(slot, year, month, day)
            const slotEnd = new Date(slotTime.getTime() + SLOT_DURATION_MS)

            const bufferMs = BUFFER_MINUTES * 60 * 1000
            const bufferedEventStart = new Date(eventStartCT.getTime() - bufferMs)
            const bufferedEventEnd = new Date(eventEndCT.getTime() + bufferMs)

            if (slotTime < bufferedEventEnd && slotEnd > bufferedEventStart) {
              bookedSlots.add(slot)
            }
          })
        })
      }
    } catch (error) {
      console.error('Error fetching Supabase events for content days availability:', error)
    }

    // Filter slots: remove booked + apply lead-time rule
    const now = new Date()
    const minBookableTime = new Date(now.getTime() + MIN_HOURS_LEAD_TIME * 60 * 60 * 1000)

    const selectedDateObj = new Date(date)
    selectedDateObj.setHours(0, 0, 0, 0)
    const todayObj = new Date()
    todayObj.setHours(0, 0, 0, 0)

    return allSlots.filter((slot) => {
      if (bookedSlots.has(slot)) return false

      const slotTime = slotStringToDate(slot, year, month, day)

      // If today, enforce minimum lead time
      if (selectedDateObj.getTime() === todayObj.getTime()) {
        if (slotTime <= now) return false
        if (slotTime <= minBookableTime) return false
      }

      return true
    })
  } catch (error) {
    console.error('Error fetching Content Days available slots:', error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Calendar event creation (for the scheduling step)
// ---------------------------------------------------------------------------

export async function createContentDayCallEvent(opts: {
  name: string
  email: string
  date: string
  time: string
  shootCity: string
  businessName: string
  notes?: string
}) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured')
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN not configured')
  }

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)
  } catch (tokenError: any) {
    console.error('Error refreshing Google access token:', tokenError?.message)
    throw new Error('Failed to authenticate with Google Calendar')
  }

  const [year, month, day] = opts.date.split('-').map(Number)
  const slotTime = slotStringToDate(opts.time, year, month, day)
  const slotEnd = new Date(slotTime.getTime() + SLOT_DURATION_MS)

  const fmt = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`
  }

  const startISO = `${fmt(slotTime)}-06:00`
  const endISO = `${fmt(slotEnd)}-06:00`

  const attendees = [
    { email: opts.email },
    { email: 'media@ciarajevans.com' },
  ]

  const event = {
    summary: `CJE Content Days Call. ${opts.name} (${opts.businessName})`,
    description: [
      `CJE Content Days vision call.`,
      ``,
      `Client: ${opts.name}`,
      `Business: ${opts.businessName}`,
      `Email: ${opts.email}`,
      `Preferred shoot city: ${opts.shootCity}`,
      opts.notes ? `\nNotes: ${opts.notes}` : '',
      ``,
      `Reminder: this call is to confirm shoot date + creative direction.`,
      `Shoot time is confirmed separately on this call.`,
    ].join('\n'),
    start: { dateTime: startISO, timeZone: 'America/Chicago' },
    end: { dateTime: endISO, timeZone: 'America/Chicago' },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    conferenceData: {
      createRequest: {
        requestId: `cje-cd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all',
    conferenceDataVersion: 1,
  })

  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
    hangoutLink: response.data.hangoutLink,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slotStringToDate(slot: string, year: number, month: number, day: number): Date {
  const [time, period] = slot.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let hour24 = hours
  if (period === 'PM' && hours !== 12) hour24 += 12
  if (period === 'AM' && hours === 12) hour24 = 0
  return new Date(year, month - 1, day, hour24, minutes, 0)
}

/**
 * Convert a 12-hour slot string like "8:30 AM" to a 24-hour HH:MM:SS string
 * for storing in a Postgres `time` column.
 */
export function slotToTimeColumn(slot: string): string {
  const [time, period] = slot.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let hour24 = hours
  if (period === 'PM' && hours !== 12) hour24 += 12
  if (period === 'AM' && hours === 12) hour24 = 0
  return `${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}
