import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to bypass RLS since contact_messages doesn't have a SELECT policy
    // that matches by email
    const serviceClient = createServiceClient()
    
    const { data, error } = await serviceClient
      .from('contact_messages')
      .select('*')
      .eq('sender_email', user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contact messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contact messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error) {
    console.error('Error in contact messages API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

