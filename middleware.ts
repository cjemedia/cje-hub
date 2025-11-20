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
        error: authError,
      } = await supabase.auth.getUser()

      // Only redirect if we have no user AND no auth error
      // If there's an auth error, it might be due to invalid cookies, so don't redirect
      if (!user && !authError) {
        const loginUrl = new URL('/hub/login', request.url)
        // Prevent redirect loop - only redirect if not already going to login
        if (request.nextUrl.pathname !== '/hub/login') {
          return NextResponse.redirect(loginUrl)
        }
      }
      // If there's an auth error, allow the request to continue
      // The page can handle showing an error or redirecting as needed
    } catch (error) {
      // If auth check throws an error, don't redirect - allow access
      // This prevents redirect loops when Supabase is misconfigured or cookies are invalid
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error on protected route:', error)
      }
      // Don't redirect on error - let the page handle it
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
        // Also check that we're not in a redirect loop by checking the referer
        const referer = request.headers.get('referer')
        if (request.nextUrl.pathname !== dashboardUrl.pathname && 
            (!referer || !referer.includes('/hub/login'))) {
          return NextResponse.redirect(dashboardUrl)
        }
      }
      // If no user or there's an error, just allow access to the public page
      // Return early to prevent any further processing
      return response
    } catch (error) {
      // If auth check throws an error, allow access to public pages
      // This is critical to prevent redirect loops when Supabase is misconfigured
      // Log error in development but don't block access
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error on public route:', error)
      }
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

