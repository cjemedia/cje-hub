import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const expected = process.env.AIRBNB_MARKETING_PASSWORD

    if (!expected) {
      return NextResponse.json({ error: 'Password not configured' }, { status: 500 })
    }

    if (typeof password !== 'string' || password.toLowerCase().trim() !== expected.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Invalid' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
