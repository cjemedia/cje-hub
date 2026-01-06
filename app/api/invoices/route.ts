import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectId = formData.get('project_id') as string | null
    const userId = formData.get('user_id') as string | null
    const amount = formData.get('amount') as string | null
    const description = formData.get('description') as string | null
    const stripeLink = formData.get('stripe_link') as string | null
    const status = (formData.get('status') as string | null) || 'pending'
    const receiptFile = formData.get('receipt') as File | null

    if (!projectId || !userId || !amount || !stripeLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    let receiptUrl: string | null = null

    // Upload receipt PDF if provided
    if (receiptFile) {
      // Check if storage bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const receiptsBucket = buckets?.find(b => b.name === 'receipts' || b.name === 'invoices')
      
      if (!receiptsBucket) {
        console.error('Receipts storage bucket not found. Please create "receipts" or "invoices" bucket in Supabase Storage.')
      } else {
        const bucketName = receiptsBucket.name
        const path = `${projectId}/${Date.now()}-${receiptFile.name}`
        
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, receiptFile, {
          cacheControl: '3600',
          upsert: false,
        })

        if (uploadError) {
          console.error('Error uploading receipt:', uploadError)
          return NextResponse.json(
            { error: process.env.NODE_ENV === 'development' ? `Receipt upload failed: ${uploadError.message}` : 'Failed to upload receipt' },
            { status: 500 }
          )
        }

        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path)
        receiptUrl = publicUrlData.publicUrl
      }
    }

    // Create invoice
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        project_id: projectId,
        user_id: userId,
        client_id: userId, // Keep for backward compatibility
        amount: parseFloat(amount),
        description: description || null,
        stripe_link: stripeLink,
        receipt_url: receiptUrl,
        status: status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Database error: ${error.message}` : 'Failed to create invoice' },
        { status: 500 }
      )
    }

    await logProjectActivity(projectId, userId, 'invoice_created', {
      invoice_id: data.id,
      amount: data.amount,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error creating invoice:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

