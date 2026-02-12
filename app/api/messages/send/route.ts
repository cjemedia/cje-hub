import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, sender_type, content, project_id, sender_id, message_type, skip_email } = body || {}

    if (!user_id || !sender_type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id,
        sender_type,
        sender_id: sender_id || null,
        content,
        read: false,
        project_id: project_id || null,
        message_type: message_type || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Message insert error:', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Fetch user info for notifications
    const { data: userProfile } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user_id)
      .maybeSingle()

    // Fetch project info if message was sent from a specific project
    let project: { id: string; name: string } | null = null
    if (project_id) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', project_id)
        .maybeSingle()
      if (projectData) {
        project = projectData as { id: string; name: string }
      }
    }

    // Send email notification
    if (!skip_email) try {
      if (sender_type === 'admin') {
        if (userProfile?.email) {
          await sendEmail({
            to: userProfile.email,
            subject: 'New message from The CJE Experience',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>New message from The CJE Experience</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">New Message</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
        You have a new message from The CJE Experience team
      </p>
    </div>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; margin: 0; white-space: pre-wrap; line-height: 1.6;">${content}</p>
    </div>
    ${project ? `
      <p style="color: rgba(255, 255, 255, 0.7); margin-top: 8px; text-align: center; font-size: 14px;">
        This message is about your project: <strong>${project.name}</strong>.
      </p>
      <p style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ciarajevans.com'}/hub/projects/${project.id}" style="color: #ffffff; text-decoration: underline;">View this project in your portal</a>
      </p>
    ` : ''}
    <p style="margin-top: ${project ? '12' : '24'}px; text-align: center;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/hub/messages" style="color: #ffffff; text-decoration: underline;">View messages</a></p>
  </div>
</body>
</html>
            `,
          })
        }
      } else {
        await sendEmail({
          to: 'media@ciarajevans.com',
          subject: `New message from ${userProfile?.name || 'a client'}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>New message from ${userProfile?.name || 'a client'}</title>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 40px 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://ciarajevans.com/images/cje-logo.png" alt="The CJE Experience" width="240" height="auto" style="max-width: 240px; width: 240px; height: auto; display: block; margin: 0 auto 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700; text-align: center;">New Client Message</h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; margin: 0; text-align: center;">
        ${userProfile?.name || 'Unknown'} (${userProfile?.email || 'no email'})
      </p>
    </div>
    <div style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="color: #ffffff; margin: 0; white-space: pre-wrap; line-height: 1.6;">${content}</p>
    </div>
    ${project ? `
      <p style="color: rgba(255, 255, 255, 0.7); margin-top: 8px; text-align: center; font-size: 14px;">
        This message was sent from project: <strong>${project.name}</strong>.
      </p>
      <p style="margin-top: 8px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/projects/${project.id}" style="color: #ffffff; text-decoration: underline;">Open this project in admin</a>
      </p>
    ` : ''}
    <p style="margin-top: 24px; text-align: center;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/messages" style="color: #ffffff; text-decoration: underline;">View in admin</a></p>
  </div>
</body>
</html>
          `,
        })
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
      // continue; do not fail request
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Messages send route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

