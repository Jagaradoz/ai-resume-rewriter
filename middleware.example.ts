import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("Hello world! This runs on every matching request.");
  
  // You can also inspect the request here
  // console.log("Requested path:", request.nextUrl.pathname);

  // Return NextResponse.next() to continue to the actual page/API
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/about/:path*',
}
