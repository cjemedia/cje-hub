import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

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
    
    // Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.error('Deliverables error: Failed to list buckets', bucketError)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Bucket check failed: ${bucketError.message}` : 'Storage configuration error' },
        { status: 500 }
      )
    }

    const deliverablesBucket = buckets?.find(b => b.name === 'deliverables')
    if (!deliverablesBucket) {
      console.error('Deliverables error: Storage bucket "deliverables" does not exist')
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? 'Storage bucket "deliverables" does not exist. Please create it in Supabase Storage.' : 'Storage configuration error' },
        { status: 500 }
      )
    }

    const path = `${projectId}/${file.name}`

    const { error: uploadError } = await supabase.storage.from('deliverables').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      console.error('Deliverables error: File upload failed', uploadError)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Upload failed: ${uploadError.message}` : 'Failed to upload file' },
        { status: 500 }
      )
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
      console.error('Deliverables error: Database insert failed', error)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Database error: ${error.message}` : 'Failed to save deliverable' },
        { status: 500 }
      )
    }

    await logProjectActivity(projectId, null, 'resource_uploaded', { deliverable_id: data.id, name })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Deliverables error:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

