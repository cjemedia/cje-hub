import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching intake forms:', error)
      return NextResponse.json({ error: 'Failed to fetch intake forms' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error fetching intake forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, fields } = body || {}

    if (!name || !fields) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('intake_forms')
      .insert({
        name,
        description: description || null,
        fields,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating intake form:', error)
      return NextResponse.json({ error: 'Failed to create intake form' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error creating intake form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

