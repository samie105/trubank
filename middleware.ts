import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
 // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define paths that should be protected
  const protectedPaths = ["/dashboard"]

  // Define paths that are only accessible to non-authenticated users
  const authPaths = ["/auth/login", "/auth/register", "/auth/forgot-password"]

 // Check if the path is protected
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp))
  const isAuthPath = authPaths.some((ap) => path === ap)

  // Get the token from cookies
  const token = request.cookies.get("accessToken")?.value

  // Redirect logic
  if (isProtectedPath && !token) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthPath && token) {
    // Redirect to dashboard if trying to access auth routes with token
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that will trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - fonts (public fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
}

