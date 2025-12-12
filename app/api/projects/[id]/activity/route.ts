import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('project_activity')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching activity:', error)
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error fetching activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { user_id, action, details } = body || {}

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    await logProjectActivity(params.id, user_id || null, action, details || {})
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

