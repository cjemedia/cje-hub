// Base email wrapper - dark theme matching login page
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>The CJE Experience</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    ${content}
  </div>
</body>
</html>
`

// Client confirmation email
export const clientConfirmationEmail = (booking: {
  name: string
  date: string
  time: string
  type: string
}) => emailWrapper(`
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0 0 8px; text-align: center;">
      You're Booked!
    </h1>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
      Your session has been confirmed
    </p>
  </div>
  
  <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 32px; text-align: center;">
    Hi ${booking.name}, we're excited to connect with you!
  </p>
  
  <!-- Booking details card -->
  <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 24px; margin-bottom: 32px;">
    <p style="color: #ffffff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 20px; font-weight: 600;">Booking Details</p>
    
    <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding: 12px 0;">
      <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Session Type</p>
      <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${booking.type}</p>
    </div>
    <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding: 12px 0;">
      <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
      <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${booking.date}</p>
    </div>
    <div style="padding: 12px 0;">
      <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
      <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${booking.time}</p>
    </div>
  </div>
  
  <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin: 0 0 32px; text-align: center;">
    A calendar invite has been sent to your email. You'll receive web conferencing details before your session.
  </p>
  
  <div style="text-align: center;">
    <a href="https://ciarajevans.com" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2); mso-hide: all;">
      Visit Website
    </a>
  </div>
`)

// Admin notification email (to Ciara)
export const adminNotificationEmail = (booking: {
  name: string
  email: string
  phone: string
  date: string
  time: string
  type: string
  notes: string
}) => emailWrapper(`
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #ffffff; font-size: 30px; font-weight: 700; margin: 0 0 8px; text-align: center;">
      New Booking
    </h1>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
      ${booking.type}
    </p>
  </div>
  
  <!-- Client info -->
  <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <p style="color: #ffffff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px; font-weight: 600;">Client</p>
    <p style="color: #ffffff; font-size: 18px; margin: 0 0 8px; font-weight: 500;">${booking.name}</p>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0 0 4px;">${booking.email}</p>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0;">${booking.phone || 'No phone provided'}</p>
  </div>
  
  <!-- Session details -->
  <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <p style="color: #ffffff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px; font-weight: 600;">Session</p>
    <div style="display: flex; gap: 24px;">
      <div style="flex: 1;">
        <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${booking.date}</p>
      </div>
      <div style="flex: 1;">
        <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${booking.time}</p>
      </div>
    </div>
  </div>
  
  <!-- Notes if provided -->
  ${booking.notes ? `
  <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 24px;">
    <p style="color: #ffffff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px; font-weight: 600;">Notes</p>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${booking.notes}</p>
  </div>
  ` : ''}
`)

