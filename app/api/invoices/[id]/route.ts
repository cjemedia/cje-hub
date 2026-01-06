import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logProjectActivity } from '@/lib/activity'

type Params = { params: { id: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('invoices')
      .select('project_id, user_id, status')
      .eq('id', params.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type') || ''
    let updateData: any = {}

    if (contentType.includes('multipart/form-data')) {
      // Handle form data (for receipt uploads)
      const formData = await request.formData()
      const amount = formData.get('amount') as string | null
      const description = formData.get('description') as string | null
      const stripeLink = formData.get('stripe_link') as string | null
      const status = formData.get('status') as string | null
      const receiptFile = formData.get('receipt') as File | null

      if (amount) updateData.amount = parseFloat(amount)
      if (description !== null) updateData.description = description || null
      if (stripeLink) updateData.stripe_link = stripeLink
      if (status) {
        updateData.status = status
      }

      // Handle receipt upload
      if (receiptFile) {
        const { data: buckets } = await supabase.storage.listBuckets()
        const receiptsBucket = buckets?.find(b => b.name === 'receipts' || b.name === 'invoices')
        
        if (receiptsBucket) {
          const bucketName = receiptsBucket.name
          const path = `${existing.project_id}/${Date.now()}-${receiptFile.name}`
          
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, receiptFile, {
            cacheControl: '3600',
            upsert: false,
          })

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path)
            updateData.receipt_url = publicUrlData.publicUrl
          }
        }
      }
    } else {
      // Handle JSON data
      const body = await request.json()
      const { amount, description, stripe_link, status, receipt_url } = body || {}

      if (amount !== undefined) updateData.amount = parseFloat(amount)
      if (description !== undefined) updateData.description = description || null
      if (stripe_link !== undefined) updateData.stripe_link = stripe_link
      if (receipt_url !== undefined) updateData.receipt_url = receipt_url
      if (status !== undefined) {
        updateData.status = status
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Database error: ${error.message}` : 'Failed to update invoice' },
        { status: 500 }
      )
    }

    if (existing.project_id) {
      await logProjectActivity(existing.project_id, existing.user_id ?? null, 'invoice_updated', {
        invoice_id: params.id,
        status: data.status,
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error updating invoice:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('invoices')
      .select('project_id, user_id, receipt_url')
      .eq('id', params.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Delete receipt from storage if exists
    if (existing.receipt_url) {
      const { data: buckets } = await supabase.storage.listBuckets()
      const receiptsBucket = buckets?.find(b => b.name === 'receipts' || b.name === 'invoices')
      if (receiptsBucket) {
        const path = existing.receipt_url.split('/').slice(-2).join('/')
        await supabase.storage.from(receiptsBucket.name).remove([path]).catch(() => {})
      }
    }

    const { error } = await supabase.from('invoices').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? `Database error: ${error.message}` : 'Failed to delete invoice' },
        { status: 500 }
      )
    }

    if (existing.project_id) {
      await logProjectActivity(existing.project_id, existing.user_id ?? null, 'invoice_deleted', {
        invoice_id: params.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error deleting invoice:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

