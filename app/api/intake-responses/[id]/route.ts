import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Intake response not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error fetching intake response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { responses, user_id, project_id } = body || {}

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_responses')
      .update({
        responses: responses || {},
        submitted_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating intake response:', error)
      return NextResponse.json({ error: 'Failed to update intake response' }, { status: 500 })
    }

    if (project_id) {
      await logProjectActivity(project_id, user_id || null, 'intake_form_submitted', { response_id: params.id })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error updating intake response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

