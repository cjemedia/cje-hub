import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/hub/login', '/hub/forgot-password', '/hub/reset-password']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Allow public routes without auth check if env vars aren't set
  if (isPublicRoute) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.next()
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip auth if env vars aren't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

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

  // Protect hub routes (except public routes)
  if (request.nextUrl.pathname.startsWith('/hub') && !isPublicRoute) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(new URL('/hub/login', request.url))
      }
    } catch (error) {
      // If auth check fails, allow access to login page
      if (request.nextUrl.pathname !== '/hub/login') {
        return NextResponse.redirect(new URL('/hub/login', request.url))
      }
    }
  }

  // Redirect logged-in users away from login/forgot-password pages
  if (request.nextUrl.pathname === '/hub/login' || request.nextUrl.pathname === '/hub/forgot-password') {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return NextResponse.redirect(new URL('/hub/dashboard', request.url))
      }
    } catch (error) {
      // If auth check fails, allow access to public pages
      return NextResponse.next()
    }
  }

  return response
}

export const config = {
  matcher: [
    '/hub/:path*',
  ],
}

