import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error fetching proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    const { data: existing } = await supabase.from('proposals').select('*').eq('id', params.id).maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('proposals')
      .update(body)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating proposal:', error)
      return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
    }

    if (existing.status !== data.status) {
      await logProjectActivity(existing.project_id, existing.user_id, 'proposal_status_changed', {
        proposal_id: params.id,
        from: existing.status,
        to: data.status,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error updating proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data: existing } = await supabase.from('proposals').select('project_id, user_id').eq('id', params.id).maybeSingle()

    const { error } = await supabase.from('proposals').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting proposal:', error)
      return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
    }

    await logProjectActivity(existing?.project_id ?? null, existing?.user_id ?? null, 'proposal_deleted', { proposal_id: params.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error deleting proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

