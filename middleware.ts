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

// Use Clerk-recommended matcher to reliably exclude static assets and Next internals.
// This prevents the middleware from intercepting Turbopack dev asset requests like
// [root-of-the-server]__*.css, which can otherwise result in 500s during HMR.
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
