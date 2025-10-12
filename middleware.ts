import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { NextResponse } from "next/server";

const base = clerkMiddleware();

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  // Bypass Clerk for webhook endpoint; let it reach the route handler
  if (req.nextUrl.pathname.startsWith("/api/clerk/webhooks")) {
    return NextResponse.next();
  }
  return base(req, ev);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api/:path*",
  ],
};
