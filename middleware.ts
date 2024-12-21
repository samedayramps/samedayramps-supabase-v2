import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set the cookie in the request for the current pass
          request.cookies.set(name, value);
          // Set the cookie in the response for the browser
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.delete(name);
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // Always use getUser() instead of getSession() in server-side code for security
  const { data: { user } } = await supabase.auth.getUser();

  // Get the current path
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const isPublicRoute = path === '/sign-in' || 
                       path === '/sign-up' || 
                       path === '/forgot-password' ||
                       path.startsWith('/_next') || 
                       path.startsWith('/api/quotes/accept') ||
                       path.startsWith('/quote-accepted') ||
                       path.startsWith('/api');

  // If the user is not logged in and trying to access a protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If the user is logged in and trying to access auth pages or root
  if (user && (path === '/sign-in' || path === '/sign-up' || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
