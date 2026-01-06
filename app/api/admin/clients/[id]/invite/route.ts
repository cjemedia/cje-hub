import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'
import { portalInviteEmail } from '@/lib/email-templates'

type Params = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const userId = params.id

    // Fetch client profile
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .maybeSingle()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Generate new temporary password
    const tempPassword = `${Math.random().toString(36).slice(-8)}Aa1!`

    // Update auth user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: tempPassword,
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update user password' },
        { status: 400 }
      )
    }

    // Send invite email
    const loginUrl =
      (process.env.NEXT_PUBLIC_SITE_URL || 'https://agency.ciarajevans.com') + '/login'

    const html = portalInviteEmail({
      name: client.name || '',
      tempPassword,
      loginUrl,
    })

    await sendEmail({
      to: client.email,
      subject: 'Welcome to The CJE Experience Portal',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resending invite:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


