import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { status, paid_at } = body || {}

    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('invoices')
      .select('project_id, user_id, status')
      .eq('id', params.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        status,
        paid_at: paid_at || (status === 'paid' ? new Date().toISOString() : null),
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    if (existing.project_id) {
      await logProjectActivity(existing.project_id, existing.user_id ?? null, 'invoice_updated', {
        invoice_id: params.id,
        status: data.status,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error updating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

