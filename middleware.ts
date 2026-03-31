import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/forgot-password', '/reset-password', '/connect-with-ascend']
  const isPublicRoute = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Return early for public routes - no auth checks needed
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Skip auth if env vars aren't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Protect hub routes (public routes already excluded above)
  if (request.nextUrl.pathname.startsWith('/hub')) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      // Only redirect if we have no user AND no auth error
      if (!user && !authError) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // If auth check throws an error, don't redirect - allow access
      // This prevents redirect loops when Supabase is misconfigured
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error on protected route:', error)
      }
    }
  }

  // Protect admin routes - require auth + admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = (profile?.role as 'client' | 'admin') ?? 'client'

      if (role !== 'admin') {
        const dashboardUrl = new URL('/hub/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error on admin route:', error)
      }
      // On error, redirect to login for safety
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/hub/:path*',
    '/admin/:path*',
  ],
}


