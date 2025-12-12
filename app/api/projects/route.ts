import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, name, description, status, service_type, start_date, end_date } = body || {}

    if (!user_id || !name || !status || !service_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id,
        name,
        description: description || null,
        status,
        service_type,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    await logProjectActivity(data.id, user_id, 'project_created', { name, status, service_type })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

