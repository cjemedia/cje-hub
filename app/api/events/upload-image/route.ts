import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    // First verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be less than 10MB' }, { status: 400 })
    }

    // Generate unique filename with timestamp and random component
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const fileName = `${user.id}-${timestamp}-${random}.${fileExt}`
    const filePath = fileName

    // Use service client to bypass RLS for storage upload
    const serviceSupabase = createServiceClient()

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('event-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: uploadError.message 
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Error in upload route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

