import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('project_id') as string | null
    const name = (formData.get('name') as string | null) || (file?.name ?? '')
    const description = (formData.get('description') as string | null) || ''

    if (!file || !projectId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const path = `${projectId}/${file.name}`

    const { error: uploadError } = await supabase.storage.from('deliverables').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from('deliverables').getPublicUrl(path)
    const fileUrl = publicUrlData.publicUrl

    const { data, error } = await supabase
      .from('deliverables')
      .insert({
        project_id: projectId,
        name,
        description: description || null,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating deliverable record:', error)
      return NextResponse.json({ error: 'Failed to save deliverable' }, { status: 500 })
    }

    await logProjectActivity(projectId, null, 'resource_uploaded', { deliverable_id: data.id, name })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error uploading deliverable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

