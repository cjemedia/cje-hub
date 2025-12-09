// Base email wrapper - dark theme matching site
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The CJE Experience</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="120" height="auto" style="max-width: 120px; width: 120px; height: auto; display: block; margin: 0 auto 16px; border: 0; outline: none; text-decoration: none;" />
              <p style="color: rgb(129, 216, 208); font-size: 12px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">The CJE Experience</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #111; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="color: #666; font-size: 12px; margin: 0 0 8px;">The CJE Experience</p>
              <p style="color: #444; font-size: 11px; margin: 0;">
                <a href="https://ciarajevans.com" style="color: rgb(129, 216, 208); text-decoration: none;">ciarajevans.com</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
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
  <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 24px; text-align: center;">
    You're Booked!
  </h1>
  
  <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 32px; text-align: center;">
    Hi ${booking.name}, your session has been confirmed. We're excited to connect with you!
  </p>
  
  <!-- Booking details card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
    <tr>
      <td>
        <p style="color: #000000; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">Booking Details</p>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">
              <p style="color: #666; font-size: 12px; margin: 0;">Session Type</p>
              <p style="color: #fff; font-size: 16px; margin: 4px 0 0;">${booking.type}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">
              <p style="color: #666; font-size: 12px; margin: 0;">Date</p>
              <p style="color: #fff; font-size: 16px; margin: 4px 0 0;">${booking.date}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <p style="color: #666; font-size: 12px; margin: 0;">Time</p>
              <p style="color: #fff; font-size: 16px; margin: 4px 0 0;">${booking.time}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
  <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
    A calendar invite has been sent to your email. You'll receive web conferencing details before your session.
  </p>
  
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://ciarajevans.com" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
          Visit Website
        </a>
      </td>
    </tr>
  </table>
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
  <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0 0 8px;">
    New Booking
  </h1>
  <p style="color: rgb(129, 216, 208); font-size: 14px; margin: 0 0 32px;">${booking.type}</p>
  
  <!-- Client info -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <tr>
      <td>
        <p style="color: rgb(129, 216, 208); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">Client</p>
        <p style="color: #fff; font-size: 18px; margin: 0 0 8px;">${booking.name}</p>
        <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 4px;">${booking.email}</p>
        <p style="color: #a0a0a0; font-size: 14px; margin: 0;">${booking.phone || 'No phone provided'}</p>
      </td>
    </tr>
  </table>
  
  <!-- Session details -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <tr>
      <td>
        <p style="color: rgb(129, 216, 208); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">Session</p>
        <table width="100%">
          <tr>
            <td width="50%" style="padding: 8px 0;">
              <p style="color: #666; font-size: 12px; margin: 0;">Date</p>
              <p style="color: #fff; font-size: 16px; margin: 4px 0 0;">${booking.date}</p>
            </td>
            <td width="50%" style="padding: 8px 0;">
              <p style="color: #666; font-size: 12px; margin: 0;">Time</p>
              <p style="color: #fff; font-size: 16px; margin: 4px 0 0;">${booking.time}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
  <!-- Notes if provided -->
  ${booking.notes ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 8px; padding: 24px;">
    <tr>
      <td>
        <p style="color: rgb(129, 216, 208); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">Notes</p>
        <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 0;">${booking.notes}</p>
      </td>
    </tr>
  </table>
  ` : ''}
`)

