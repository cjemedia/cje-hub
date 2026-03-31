import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('qr_codes')
    .select('url')
    .eq('id', params.id)
    .maybeSingle()

  if (!data?.url) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciarajevans.com'))
  }

  return NextResponse.redirect(data.url)
}