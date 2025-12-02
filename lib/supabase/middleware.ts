import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/auth/callback",
    "/auth/confirm",
    "/pricing",
    "/upgrade",
    "/help",
    "/contact",
    "/privacy-policy",
    "/refund-policy",
    "/cookies",
    "/sitemap",
    "/blog",
    "/faq",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(`${route}/`)
  );

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const isPublicApiRoute =
    request.nextUrl.pathname.startsWith("/api/health") ||
    request.nextUrl.pathname.startsWith("/api/webhooks") ||
    request.nextUrl.pathname.startsWith("/api/invoices/download") ||
    request.nextUrl.pathname.startsWith("/api/contact");

  const isInvoiceViewRoute = request.nextUrl.pathname.startsWith("/invoice/");

  // Allow public routes and public API routes
  if (isPublicRoute || isPublicApiRoute || isInvoiceViewRoute) {
    return supabaseResponse;
  }

  // Redirect to sign-in if not authenticated and trying to access protected route
  if (!user && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect_url", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Return 401 for protected API routes without auth
  if (!user && isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}
