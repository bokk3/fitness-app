import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require auth
  if (
    pathname === "/signin" || 
    pathname === "/signup" || 
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/_next") || 
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icon-") || // PWA icons
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (better-auth uses "better-auth.session_token" or "__Secure-better-auth.session_token")
  const sessionToken = request.cookies.get("better-auth.session_token") || 
                       request.cookies.get("__Secure-better-auth.session_token");
  
  // Debug: log all cookies to see what's being sent
  if (!sessionToken && process.env.NODE_ENV !== 'production') {
    console.log('No session token found. All cookies:', request.cookies.getAll().map(c => c.name));
  }
  
  if (!sessionToken) {
    // Only redirect if not already on signin page to avoid loops
    if (pathname !== '/signin') {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
