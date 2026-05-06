import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    }

    // Try database first (editable from admin UI)
    let expected: string | null = null
    try {
      const supabase = createServiceClient()
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'airbnb_marketing_password')
        .single()
      if (data?.value) expected = data.value
    } catch {
      // DB lookup failed — fall through to env var
    }

    // Fallback to env var (covers initial migration period)
    if (!expected) {
      expected = process.env.AIRBNB_MARKETING_PASSWORD || null
    }

    if (!expected) {
      return NextResponse.json({ error: 'Password not configured' }, { status: 500 })
    }

    if (password.toLowerCase().trim() !== expected.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Invalid' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
