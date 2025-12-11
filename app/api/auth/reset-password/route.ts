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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #81D8D0;">Reset Your Password</h2>
          <p>You requested to reset your password for The CJE Experience account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #81D8D0; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
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

