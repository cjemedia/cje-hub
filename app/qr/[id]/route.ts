import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('qr_codes')
    .select('url')
    .eq('id', params.id)
    .maybeSingle()

  const fallback = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciarajevans.com'

  if (!data?.url) {
    return NextResponse.redirect(new URL('/', fallback))
  }

  return NextResponse.redirect(data.url)
}