import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent } from '@/lib/google-calendar'
import { sendEmail } from '@/lib/resend'
import { clientConfirmationEmail, adminNotificationEmail } from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, type, notes } = body

    // Validate required fields
    if (!name || !email || !date || !time || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check if date is in the past
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book dates in the past' },
        { status: 400 }
      )
    }

    // Check availability before booking
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

    // Create Google Calendar event FIRST (before saving to DB)
    let calendarEvent
    try {
      console.log('Attempting to create calendar event...')
      calendarEvent = await createCalendarEvent({
        name,
        email,
        date,
        time,
        type,
        notes: notes || '',
      })
      console.log('✅ Calendar event created successfully:', {
        eventId: calendarEvent?.eventId,
        htmlLink: calendarEvent?.htmlLink,
      })
    } catch (error: any) {
      console.error('❌ Error creating calendar event:', {
        message: error?.message,
        code: error?.code,
        details: error?.response?.data || error,
        stack: error?.stack,
      })
      // Don't fail the booking, but log the error clearly
      // The booking will still be saved to the database
    }

    // Save to Supabase - use service client to bypass RLS for public bookings
    let supabase
    try {
      const { createServiceClient } = await import('@/lib/supabase/service')
      supabase = createServiceClient()
      console.log('✅ Service client created successfully')
    } catch (serviceError: any) {
      console.error('❌ Failed to create service client:', serviceError?.message)
      return NextResponse.json(
        { error: 'Server configuration error', details: serviceError?.message },
        { status: 500 }
      )
    }
    
    // Parse time string to time format for legacy column
    const [timeStr, period] = time.split(' ')
    const [hours, minutes] = timeStr.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0
    const timeValue = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
    
    // Map new inquiry types to legacy type values for check constraint compatibility
    // The legacy type column has a CHECK constraint that only allows 'meeting' or 'content-shoot'
    // Map all new inquiry types to 'meeting' for backward compatibility
    const legacyType = 'meeting'
    
    console.log('💾 Attempting to save booking to database...')
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        // New columns for public booking system
        name,
        email,
        phone: phone || null,
        booking_date: date,
        booking_time: time,
        inquiry_type: type,
        google_event_id: calendarEvent?.eventId || null,
        // Legacy columns for backward compatibility
        client_id: null, // Public bookings don't have client_id
        type: legacyType, // Map to 'meeting' to satisfy check constraint
        date: date, // Keep for backward compatibility
        time: timeValue, // Convert to time format
        duration: 45, // Default 45 minutes for public bookings
        notes: notes || null,
        status: 'confirmed',
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error saving booking to database:')
      console.error('❌ Error code:', dbError.code)
      console.error('❌ Error message:', dbError.message)
      console.error('❌ Error details:', dbError.details)
      console.error('❌ Error hint:', dbError.hint)
      console.error('❌ Full error:', JSON.stringify(dbError, null, 2))
      
      // If it's an RLS error, provide more helpful message
      if (dbError.code === '42501') {
        console.error('❌ RLS Policy Error - Service client may not be working correctly')
        console.error('❌ Check that SUPABASE_SERVICE_ROLE_KEY is set correctly')
      }
      
      // Return error to user so they know booking wasn't saved
      return NextResponse.json(
        { 
          error: 'Failed to save booking to database', 
          details: dbError.message,
          code: dbError.code 
        },
        { status: 500 }
      )
    }
    
    console.log('✅ Booking saved to database successfully')
    console.log('✅ Booking ID:', booking?.id)

    // Format date in local timezone to avoid timezone shift (used for both client and admin emails)
    const formatDateForEmail = (dateString: string) => {
      // Parse date string (YYYY-MM-DD) in local timezone
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month is 0-indexed
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    // Send confirmation email to client
    try {
      console.log('📧 Attempting to send client confirmation email to:', email)
      
      // Validate email format before sending
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        console.error('❌ Invalid email address format:', email)
        // Continue anyway, but log the issue
      }
      
      const clientEmailResult = await sendEmail({
        to: email.trim(), // Trim whitespace
        subject: 'Booking Confirmed - The CJE Experience',
        html: clientConfirmationEmail({
          name,
          date: formatDateForEmail(date),
          time,
          type,
        }),
        from: 'The CJE Experience <booking@ciarajevans.com>',
        replyTo: 'booking@ciarajevans.com',
      })
      
      if (!clientEmailResult.success) {
        console.error('❌ Failed to send client confirmation email:', JSON.stringify(clientEmailResult.error, null, 2))
        console.error('❌ Email address that failed:', email)
        // Don't fail the booking, but log the error
      } else {
        console.log('✅ Client confirmation email sent successfully')
        console.log('✅ Recipient:', email)
        console.log('✅ Message ID:', clientEmailResult.data?.id)
        console.log('✅ Check Resend dashboard for delivery status: https://resend.com/emails')
      }
    } catch (emailError: any) {
      console.error('❌ Error sending confirmation email:', {
        message: emailError?.message,
        error: emailError,
        emailAddress: email,
      })
      // Don't fail the booking, but log the error
    }

    // Send notification email to admin(s)
    // For website/portal/tools bookings, send to both media@ and tech-support@
    const techSupportTypes = ['Custom Website', 'Client Portal', 'Business Tools']
    const requiresTechSupport = techSupportTypes.includes(type)
    const adminRecipients = requiresTechSupport 
      ? ['media@ciarajevans.com', 'tech-support@ciarajevans.com']
      : ['media@ciarajevans.com']
    
    try {
      console.log(`Attempting to send admin notification email(s) to: ${adminRecipients.join(', ')}`)
      
      // Send to all recipients
      const emailPromises = adminRecipients.map(async (recipient) => {
        const result = await sendEmail({
          to: recipient,
          subject: `New Booking: ${type} - ${name}`,
          html: adminNotificationEmail({
            name,
            email,
            phone: phone || '',
            date: formatDateForEmail(date),
            time,
            type,
            notes: notes || '',
          }),
          from: 'The CJE Experience <booking@ciarajevans.com>',
        })
        return { recipient, result }
      })
      
      const emailResults = await Promise.all(emailPromises)
      
      emailResults.forEach(({ recipient, result }) => {
        if (!result.success) {
          console.error(`❌ Failed to send admin notification email to ${recipient}:`, JSON.stringify(result.error, null, 2))
        } else {
          console.log(`✅ Admin notification email sent successfully to ${recipient}. Message ID:`, result.data?.id)
        }
      })
    } catch (emailError: any) {
      console.error('❌ Error sending admin notification:', {
        message: emailError?.message,
        error: emailError,
      })
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking?.id,
        name,
        email,
        date,
        time,
        type,
        calendarLink: calendarEvent?.htmlLink,
      },
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

