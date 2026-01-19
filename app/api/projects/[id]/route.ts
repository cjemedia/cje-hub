import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const projectId = params.id

    const { data: project, error } = await supabase
      .from('projects')
      .select('*, users(name, email)')
      .eq('id', projectId)
      .maybeSingle()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const [{ data: invoiceAgg }, { data: bookingAgg }, { data: messageAgg }] = await Promise.all([
      supabase
        .from('invoices')
        .select('amount,status')
        .eq('project_id', projectId),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
    ])

    const totalInvoiced = (invoiceAgg || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const totalPaid = (invoiceAgg || [])
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

    return NextResponse.json({
      project,
      stats: {
        totalInvoiced,
        totalPaid,
        bookingsCount: bookingAgg?.length ?? bookingAgg ?? 0,
        messagesCount: messageAgg?.length ?? messageAgg ?? 0,
      },
    })
  } catch (error) {
    console.error('API error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { 
      name, description, status, service_type, start_date, end_date, dropbox_link, assets_folder_url,
      proposal_url, proposal_sent_at, proposal_message_id,
      style_guide_url, style_guide_sent_at, style_guide_message_id
    } = body || {}
    const projectId = params.id

    const supabase = createServiceClient()
    const { data: existing } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (service_type !== undefined) updateData.service_type = service_type
    if (start_date !== undefined) updateData.start_date = start_date || null
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (dropbox_link !== undefined) updateData.dropbox_link = dropbox_link || null
    if (assets_folder_url !== undefined) updateData.assets_folder_url = assets_folder_url || null
    if (proposal_url !== undefined) updateData.proposal_url = proposal_url || null
    if (proposal_sent_at !== undefined) updateData.proposal_sent_at = proposal_sent_at || null
    if (proposal_message_id !== undefined) updateData.proposal_message_id = proposal_message_id || null
    if (style_guide_url !== undefined) updateData.style_guide_url = style_guide_url || null
    if (style_guide_sent_at !== undefined) updateData.style_guide_sent_at = style_guide_sent_at || null
    if (style_guide_message_id !== undefined) updateData.style_guide_message_id = style_guide_message_id || null

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    if (existing.status !== status) {
      await logProjectActivity(projectId, existing.user_id, 'project_status_changed', {
        from: existing.status,
        to: status,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const projectId = params.id

    const { data: existing } = await supabase.from('projects').select('user_id').eq('id', projectId).maybeSingle()
    const { error } = await supabase.from('projects').delete().eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    await logProjectActivity(projectId, existing?.user_id ?? null, 'project_deleted', {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

