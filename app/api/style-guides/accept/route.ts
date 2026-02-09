import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { project_id, client_name } = await request.json()

    if (!project_id || !client_name) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    await supabase
      .from('projects')
      .update({ style_guide_status: 'accepted' })
      .eq('id', project_id)

    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', project_id)
      .single()

    await sendEmail({
      to: 'media@ciarajevans.com',
      subject: `Style Guide Approved - ${client_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Style Guide Approved</h2>
          <p><strong>Client:</strong> ${client_name}</p>
          <p><strong>Project:</strong> ${project?.name || project_id}</p>
          <p>The client has approved the style guide. You can proceed with development.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Style guide accept error:', error)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
