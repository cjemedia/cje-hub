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
        const loginUrl = new URL('/hub/login', request.url)
        // Prevent redirect loop - only redirect if not already going to login
        if (request.nextUrl.pathname !== '/hub/login') {
          return NextResponse.redirect(loginUrl)
        }
      }
    } catch (error) {
      // If auth check fails, only redirect to login if we're not already there
      if (request.nextUrl.pathname !== '/hub/login') {
        const loginUrl = new URL('/hub/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // Redirect logged-in users away from login/forgot-password pages
  // Only redirect if we have a valid authenticated user
  if (isPublicRoute && (request.nextUrl.pathname === '/hub/login' || request.nextUrl.pathname === '/hub/forgot-password')) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      // Only redirect if we have a valid user with no errors
      // This prevents redirect loops when auth is misconfigured or cookies are invalid
      if (user && user.id && !userError) {
        const dashboardUrl = new URL('/hub/dashboard', request.url)
        // Ensure we're not already on the dashboard to prevent loops
        if (request.nextUrl.pathname !== dashboardUrl.pathname) {
          return NextResponse.redirect(dashboardUrl)
        }
      }
      // If no user or there's an error, just allow access to the public page
      // Return early to prevent any further processing
      return response
    } catch (error) {
      // If auth check throws an error, allow access to public pages
      // This is critical to prevent redirect loops when Supabase is misconfigured
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    '/hub/:path*',
  ],
}

