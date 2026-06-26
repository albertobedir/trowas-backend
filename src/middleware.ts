import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMarketingRoute } from "@/lib/webflow/marketing-routes";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin routes — separate auth from regular users
  if (path.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin_access_token")?.value;
    const isAdminLoginPage = path === "/admin";

    if (isAdminLoginPage && adminToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (!isAdminLoginPage && !adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/register" ||
    isMarketingRoute(path) ||
    path.includes("/connect/") ||
    path.startsWith("/uploads/");
  // Check for authentication token
  const acces_token = request.cookies.get("access_token")?.value;
  const refresh_token = request.cookies.get("refresh_token")?.value;

  if (path === "/" && !acces_token && !refresh_token) {
    const referer = request.headers.get("referer");
    let fromMarketing = false;

    if (referer) {
      try {
        fromMarketing = isMarketingRoute(new URL(referer).pathname);
      } catch {
        fromMarketing = false;
      }
    }

    if (!fromMarketing) {
      return NextResponse.redirect(new URL("/homepage", request.url));
    }
  }

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
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|assets|uploads).*)"],
};
