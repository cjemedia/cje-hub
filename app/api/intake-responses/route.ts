import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_id, project_id, user_id, responses } = body || {}

    if (!form_id || !project_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_responses')
      .insert({
        form_id,
        project_id,
        user_id,
        responses: responses || {},
        submitted_at: responses ? new Date().toISOString() : null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating intake response:', error)
      return NextResponse.json({ error: 'Failed to create intake response' }, { status: 500 })
    }

    await logProjectActivity(project_id, user_id, 'intake_form_sent', { form_id })
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error creating intake response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

