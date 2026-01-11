import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calendar } from '@/lib/google-calendar'
import { sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, action, date, time, message } = body

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get actor role
    const { data: actorProfile } = await supabase
      .from('users')
      .select('id, role, name, email')
      .eq('id', user.id)
      .maybeSingle()

    const actorRole = actorProfile?.role || 'client'

    // Get the booking to verify ownership and get google_event_id
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, users(name, email)')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      )
    }

    // If not admin, ensure ownership
    if (actorRole !== 'admin' && booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only allow cancel/reschedule for upcoming bookings
    const today = new Date().toISOString().split('T')[0]
    if (booking.booking_date < today) {
      return NextResponse.json(
        { error: 'Cannot modify past bookings' },
        { status: 400 }
      )
    }

    if (action === 'cancel') {
      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Error cancelling booking:', updateError)
        return NextResponse.json(
          { error: 'Failed to cancel booking' },
          { status: 500 }
        )
      }

      // Cancel Google Calendar event if it exists
      if (booking.google_event_id) {
        try {
          const calendarId = process.env.GOOGLE_CALENDAR_ID
          if (calendarId) {
            await calendar.events.delete({
              calendarId,
              eventId: booking.google_event_id,
              sendUpdates: 'all', // Notify attendees
            })
          }
        } catch (calendarError: any) {
          console.error('Error cancelling calendar event:', calendarError)
          // Don't fail the request if calendar cancellation fails
        }
      }

      // Email notifications
      const clientName = booking.users?.name || booking.name || 'Client'
      const clientEmail = booking.users?.email || booking.email
      const adminEmail = 'media@ciarajevans.com'
      const originalDate = booking.booking_date ? formatDate(booking.booking_date) : 'N/A'
      const originalTime = booking.booking_time || 'N/A'

      if (actorRole === 'admin') {
        // Notify client
        if (clientEmail) {
          await sendEmail({
            to: clientEmail,
            subject: `Your booking with The CJE Experience has been cancelled`,
            html: bookingEmailTemplate({
              title: 'Booking Cancelled',
              body: `
                <p style="margin: 0 0 10px; color: #ffffff;">Hi ${clientName},</p>
                <p style="margin: 0 0 10px; color: #ffffff;">Your booking has been cancelled.</p>
                <p style="margin: 0 0 10px; color: #ffffff;"><strong>Original Date/Time:</strong> ${originalDate} at ${originalTime}</p>
                ${message ? `<p style="margin: 0 0 10px; color: #ffffff;"><strong>Note from admin:</strong> ${message}</p>` : ''}
                <p style="margin: 0 0 10px; color: #ffffff;">You can view your bookings in the portal.</p>
              `,
              ctaLabel: 'View Bookings',
              ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/hub/bookings`,
            }),
          })
        }
      } else {
        // Notify admin
        await sendEmail({
          to: adminEmail,
          subject: `${clientName} has cancelled their booking`,
          html: bookingEmailTemplate({
            title: 'Booking Cancelled',
            body: `
              <p style="margin: 0 0 10px; color: #ffffff;">${clientName} cancelled a booking.</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Email:</strong> ${clientEmail || 'N/A'}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Original Date/Time:</strong> ${originalDate} at ${originalTime}</p>
            `,
            ctaLabel: 'View Bookings',
            ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/bookings`,
          }),
        })
      }

      return NextResponse.json({ success: true, message: 'Booking cancelled successfully' })
    }

    if (action === 'reschedule') {
      if (!date || !time) {
        return NextResponse.json(
          { error: 'Date and time are required for rescheduling' },
          { status: 400 }
        )
      }

      // Check availability
      const availabilityResponse = await fetch(
        `${request.nextUrl.origin}/api/booking/availability?date=${date}`
      )
      const availabilityData = await availabilityResponse.json()
      
      if (!availabilityData.availableSlots?.includes(time)) {
        return NextResponse.json(
          { error: 'Selected time slot is no longer available' },
          { status: 409 }
        )
      }

      // Parse time string to time format for legacy column
      const [timeStr, period] = time.split(' ')
      const [hours, minutes] = timeStr.split(':').map(Number)
      let hour24 = hours
      if (period === 'PM' && hours !== 12) hour24 += 12
      if (period === 'AM' && hours === 12) hour24 = 0
      const timeValue = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`

      // Capture originals and update booking in database
      const originalDate = booking.booking_date
      const originalTime = booking.booking_time
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          original_date: originalDate || booking.booking_date,
          original_time: originalTime || booking.booking_time,
          booking_date: date,
          booking_time: time,
          date: date, // Legacy column
          time: timeValue, // Legacy column
          status: 'rescheduled',
          rescheduled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Error rescheduling booking:', updateError)
        return NextResponse.json(
          { error: 'Failed to reschedule booking' },
          { status: 500 }
        )
      }

      // Update Google Calendar event if it exists
      if (booking.google_event_id) {
        try {
          const calendarId = process.env.GOOGLE_CALENDAR_ID
          if (calendarId) {
            // Parse date and time
            const [timeStr2, period2] = time.split(' ')
            const [hours2, minutes2] = timeStr2.split(':').map(Number)
            let hour = hours2
            if (period2 === 'PM' && hours2 !== 12) hour += 12
            if (period2 === 'AM' && hours2 === 12) hour = 0

            const [year, month, day] = date.split('-').map(Number)
            const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minutes2).padStart(2, '0')}:00`
            
            let endHour = hour
            let endMinute = minutes2 + 45
            if (endMinute >= 60) {
              endHour += Math.floor(endMinute / 60)
              endMinute = endMinute % 60
            }
            if (endHour >= 24) {
              endHour = endHour % 24
            }
            
            const endDateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:${String(endMinute).toString().padStart(2, '0')}:00`
            
            const startDateTimeISO = `${dateTimeString}-06:00`
            const endDateTimeISO = `${endDateTimeString}-06:00`

            await calendar.events.patch({
              calendarId,
              eventId: booking.google_event_id,
              requestBody: {
                start: {
                  dateTime: startDateTimeISO,
                  timeZone: 'America/Chicago',
                },
                end: {
                  dateTime: endDateTimeISO,
                  timeZone: 'America/Chicago',
                },
              },
              sendUpdates: 'all', // Notify attendees
            })
          }
        } catch (calendarError: any) {
          console.error('Error updating calendar event:', calendarError)
          // Don't fail the request if calendar update fails
        }
      }

      // Email notifications
      const clientName = booking.users?.name || booking.name || 'Client'
      const clientEmail = booking.users?.email || booking.email
      const adminEmail = 'media@ciarajevans.com'
      const originalDateStr = booking.booking_date ? formatDate(booking.booking_date) : 'N/A'
      const originalTimeStr = booking.booking_time || 'N/A'
      const newDateStr = formatDate(date)
      const newTimeStr = time

      if (actorRole === 'admin') {
        if (clientEmail) {
          await sendEmail({
            to: clientEmail,
            subject: `Your booking with The CJE Experience has been rescheduled`,
            html: bookingEmailTemplate({
              title: 'Booking Rescheduled',
              body: `
                <p style="margin: 0 0 10px; color: #ffffff;">Hi ${clientName},</p>
                <p style="margin: 0 0 10px; color: #ffffff;">Your booking has been rescheduled.</p>
                <p style="margin: 0 0 10px; color: #ffffff;"><strong>Original:</strong> ${originalDateStr} at ${originalTimeStr}</p>
                <p style="margin: 0 0 10px; color: #ffffff;"><strong>New:</strong> ${newDateStr} at ${newTimeStr}</p>
                ${message ? `<p style="margin: 0 0 10px; color: #ffffff;"><strong>Note from admin:</strong> ${message}</p>` : ''}
                <p style="margin: 0 0 10px; color: #ffffff;">You can view your bookings in the portal.</p>
              `,
              ctaLabel: 'View Bookings',
              ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/hub/bookings`,
            }),
          })
        }
      } else {
        await sendEmail({
          to: adminEmail,
          subject: `${clientName} has rescheduled their booking`,
          html: bookingEmailTemplate({
            title: 'Booking Rescheduled',
            body: `
              <p style="margin: 0 0 10px; color: #ffffff;">${clientName} rescheduled a booking.</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Email:</strong> ${clientEmail || 'N/A'}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>Original:</strong> ${originalDateStr} at ${originalTimeStr}</p>
              <p style="margin: 0 0 10px; color: #ffffff;"><strong>New:</strong> ${newDateStr} at ${newTimeStr}</p>
            `,
            ctaLabel: 'View Bookings',
            ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/bookings`,
          }),
        })
      }

      return NextResponse.json({ success: true, message: 'Booking rescheduled successfully' })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// PUT handler - Update booking (status, date, time, notes)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, status, date, time, notes } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get actor role
    const { data: actorProfile } = await supabase
      .from('users')
      .select('id, role, name, email')
      .eq('id', user.id)
      .maybeSingle()

    const actorRole = actorProfile?.role || 'client'

    // Get the booking to verify ownership and get google_event_id
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, users(name, email)')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If not admin, ensure ownership
    if (actorRole !== 'admin' && booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse time string to time format for legacy column
    let timeValue = ''
    if (time) {
      try {
        const [timeStr, period] = time.split(' ')
        const [hours, minutes] = timeStr.split(':').map(Number)
        let hour24 = hours
        if (period === 'PM' && hours !== 12) hour24 += 12
        if (period === 'AM' && hours === 12) hour24 = 0
        timeValue = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      } catch (parseError) {
        console.error('Error parsing time:', parseError)
      }
    }

    // Update booking in Supabase
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (status !== undefined) updateData.status = status
    if (date !== undefined) {
      updateData.booking_date = date
      updateData.date = date // Legacy column
    }
    if (time !== undefined) {
      updateData.booking_time = time
      if (timeValue) updateData.time = timeValue // Legacy column
    }
    if (notes !== undefined) updateData.notes = notes || null

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Update Google Calendar event if it exists
    if (booking.google_event_id) {
      try {
        const calendarId = process.env.GOOGLE_CALENDAR_ID
        if (calendarId) {
          // Use updated date/time or existing
          const updateDate = date || booking.booking_date
          const updateTime = time || booking.booking_time
          const updateStatus = status !== undefined ? status : booking.status

          const requestBody: any = {}

          // Update date/time if provided
          if (date || time) {
            // Parse date and time
            const [timeStr, period] = updateTime.split(' ')
            const [hours, minutes] = timeStr.split(':').map(Number)
            let hour = hours
            if (period === 'PM' && hours !== 12) hour += 12
            if (period === 'AM' && hours === 12) hour = 0

            const [year, month, day] = updateDate.split('-').map(Number)
            const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
            
            let endHour = hour
            let endMinute = minutes + 45
            if (endMinute >= 60) {
              endHour += Math.floor(endMinute / 60)
              endMinute = endMinute % 60
            }
            if (endHour >= 24) {
              endHour = endHour % 24
            }
            
            const endDateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:${String(endMinute).toString().padStart(2, '0')}:00`
            
            const startDateTimeISO = `${dateTimeString}-06:00`
            const endDateTimeISO = `${endDateTimeString}-06:00`

            requestBody.start = {
              dateTime: startDateTimeISO,
              timeZone: 'America/Chicago',
            }
            requestBody.end = {
              dateTime: endDateTimeISO,
              timeZone: 'America/Chicago',
            }
          }

          // Update summary if status changed
          if (status !== undefined) {
            requestBody.summary = `${updateStatus.charAt(0).toUpperCase() + updateStatus.slice(1)} - ${booking.users?.name || booking.name || 'Booking'}`
          }

          // Update description if notes changed
          if (notes !== undefined) {
            requestBody.description = notes || ''
          }

          // Only update if there are changes to make
          if (Object.keys(requestBody).length > 0) {
            await calendar.events.patch({
              calendarId,
              eventId: booking.google_event_id,
              requestBody,
              sendUpdates: 'all', // Notify attendees
            })
          }
        }
      } catch (calendarError: any) {
        console.error('Error updating calendar event:', calendarError)
        // Don't fail the request if calendar update fails
      }
    }

    return NextResponse.json({ success: true, message: 'Booking updated successfully' })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE handler - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = request.nextUrl.searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get actor role
    const { data: actorProfile } = await supabase
      .from('users')
      .select('id, role, name, email')
      .eq('id', user.id)
      .maybeSingle()

    const actorRole = actorProfile?.role || 'client'

    // Only admins can delete bookings
    if (actorRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    // Get the booking to get google_event_id
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('google_event_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching booking:', fetchError)
    }

    // Delete Google Calendar event if it exists
    if (booking?.google_event_id) {
      try {
        const calendarId = process.env.GOOGLE_CALENDAR_ID
        if (calendarId) {
          await calendar.events.delete({
            calendarId,
            eventId: booking.google_event_id,
            sendUpdates: 'all', // Notify attendees
          })
        }
      } catch (calendarError: any) {
        console.error('Error deleting calendar event:', calendarError)
        // Continue even if calendar deletion fails
      }
    }

    // Delete booking from Supabase
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (deleteError) {
      console.error('Error deleting booking:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function bookingEmailTemplate({
  title,
  body,
  ctaLabel,
  ctaUrl,
}: {
  title: string
  body: string
  ctaLabel: string
  ctaUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${title}</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">${title}</h2>
    </div>
    <div style="color: #ffffff; line-height: 1.6; font-size: 16px; margin-bottom: 32px;">${body}</div>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${ctaUrl}" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${ctaLabel}</a>
    </div>
  </div>
</body>
</html>
  `
}

