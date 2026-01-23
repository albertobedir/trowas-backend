import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {  // Get the current path
  const path = request.nextUrl.pathname;
  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth/login" || path === "/auth/register" || path.includes("/connect/");

  // Check for authentication token
  const acces_token = request.cookies.get("access_token")?.value;
  const refresh_token = request.cookies.get("refresh_token")?.value;
  // If not authenticated and trying to access a protected route, redirect to login
 
  if (!isPublicPath && !acces_token) {
    if (refresh_token) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }



  
  // If authenticated and trying to access login/register pages, redirect to dashboard
  if (acces_token && (path === "/auth/login" || path === "/auth/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}



// Configure which routes the middleware applies to
export const config = {
  // Match all routes except:
  // - API routes
  // - Static files (/favicon.ico, /_next/*)
  // - Public assets (/images/*)
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
