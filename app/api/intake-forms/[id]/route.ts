import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_forms')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Intake form not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error fetching intake form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { name, description, fields } = body || {}

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_forms')
      .update({
        name,
        description: description || null,
        fields,
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating intake form:', error)
      return NextResponse.json({ error: 'Failed to update intake form' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error updating intake form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('intake_forms').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting intake form:', error)
      return NextResponse.json({ error: 'Failed to delete intake form' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error deleting intake form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

