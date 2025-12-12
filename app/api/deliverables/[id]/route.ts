import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('deliverables')
      .select('id, project_id, file_url')
      .eq('id', params.id)
      .maybeSingle()

    const { error } = await supabase.from('deliverables').delete().eq('id', params.id)
    if (error) {
      console.error('Error deleting deliverable:', error)
      return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 })
    }

    if (existing?.file_url) {
      const path = existing.file_url.split('/').slice(-2).join('/')
      await supabase.storage.from('deliverables').remove([path]).catch(() => {})
    }

    if (existing?.project_id) {
      await logProjectActivity(existing.project_id, null, 'resource_deleted', { deliverable_id: params.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error deleting deliverable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

