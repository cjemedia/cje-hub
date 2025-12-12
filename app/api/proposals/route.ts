import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching proposals:', error)
      return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error fetching proposals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, user_id, title, description, items, total_amount, valid_until, status } = body || {}

    if (!project_id || !user_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        project_id,
        user_id,
        title,
        description: description || null,
        items: items || [],
        total_amount: total_amount || 0,
        valid_until: valid_until || null,
        status: status || 'draft',
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating proposal:', error)
      return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
    }

    await logProjectActivity(project_id, user_id, 'proposal_created', { proposal_id: data.id })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error creating proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

