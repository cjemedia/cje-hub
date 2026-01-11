import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'
import { portalInviteEmail } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, phone, sendInvite = true } = body || {}

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if email already exists in users table
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = `${Math.random().toString(36).slice(-8)}Aa1!`

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 400 }
      )
    }

    // Insert into users table
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      name,
      company: company || null,
      phone: phone || null,
      role: 'client',
      must_change_password: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    // Optionally send invite email
    if (sendInvite) {
      const loginUrl =
        (process.env.NEXT_PUBLIC_SITE_URL || 'https://agency.ciarajevans.com') + '/login'

      const html = portalInviteEmail({
        name,
        tempPassword,
        loginUrl,
      })

      await sendEmail({
        to: email,
        subject: 'Welcome to The CJE Experience Portal',
        html,
      })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


