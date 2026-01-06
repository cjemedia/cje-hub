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
    const { name, description, status, service_type, start_date, end_date, dropbox_link } = body || {}
    const projectId = params.id

    const supabase = createServiceClient()
    const { data: existing } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        status,
        service_type,
        start_date: start_date || null,
        end_date: end_date || null,
        dropbox_link: dropbox_link || null,
      })
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

