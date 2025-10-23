import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/help(.*)",
  "/contact(.*)",
  "/privacy-policy(.*)",
  "/api/health(.*)",
  "/api/clerk/webhooks(.*)",
  "/api/webhooks/resend(.*)",
  "/api/invoices/download(.*)",
  "/invoice(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // If signed in and visiting home or auth pages, send to dashboard
  if (
    userId &&
    (url.pathname === "/" ||
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up"))
  ) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If signed out and attempting a protected route (not public), send to sign-in
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.toString());
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Exclude static assets and Next internals, include root path and APIs
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
