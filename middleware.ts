import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require auth
  if (
    pathname === "/signin" || 
    pathname === "/signup" || 
    pathname === "/login" || // Keep login for backward compatibility or redirect
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/_next") || 
    pathname === "/favicon.ico" ||
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  // better-auth uses "better-auth.session_token" or similar
  // We'll fetch the session from the API to be sure
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    const session = await response.json();

    if (!session) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  } catch (error) {
    // If fetch fails (e.g. during build or server start), we might want to allow or block
    // For safety, let's redirect to login if we can't verify
    console.error("Auth middleware error:", error);
    // return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
