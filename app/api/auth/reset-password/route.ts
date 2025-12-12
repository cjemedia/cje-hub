import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Generate password reset token
    // If user doesn't exist, this will still return success (for security)
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    if (resetError) {
      console.error('Error generating reset link:', resetError)
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      })
    }

    if (!resetData?.properties?.action_link) {
      console.error('No action link in reset data:', resetData)
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      })
    }

    // Extract the token from the recovery link
    const recoveryLink = resetData.properties.action_link
    const tokenMatch = recoveryLink.match(/token=([^&]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (!token) {
      console.error('Failed to extract token from recovery link:', recoveryLink)
      return NextResponse.json({ 
        error: 'Failed to extract reset token' 
      }, { status: 500 })
    }

    // Build the reset URL using the production domain
    // Priority: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
    let siteUrl = 'http://localhost:3000'
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    } else if (process.env.VERCEL_URL) {
      siteUrl = `https://${process.env.VERCEL_URL}`
    }
    
    const resetUrl = `${siteUrl}/reset-password?token=${token}&type=recovery`

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset Your Password - The CJE Experience',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Reset Your Password - The CJE Experience</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">Reset Your Password</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
        Follow the link below to reset your password
      </p>
    </div>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 8px;">You requested to reset your password for The CJE Experience account.</p>
    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 32px;">Click the button below to reset your password:</p>
    <div style="margin: 30px 0; text-align: center;">
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 14px 32px; background: #ffffff; background-color: #ffffff !important; color: #0a0a0a !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 1px solid rgba(255, 255, 255, 0.2); mso-hide: all;">
        Reset Password
      </a>
    </div>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-top: 24px;">Or copy and paste this link into your browser:</p>
    <p style="color: #ffffff; font-size: 12px; word-break: break-all; background-color: #0a0a0a; padding: 12px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.2);">${resetUrl}</p>
    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-top: 24px;">
      This link will expire in 1 hour. If you didn't request this, please ignore this email.
    </p>
  </div>
</body>
</html>
      `,
      from: 'The CJE Experience <booking@ciarajevans.com>',
    })

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send reset email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

