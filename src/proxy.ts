import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/akun") ||
    pathname.startsWith("/pajangin/dashboard") ||
    pathname.startsWith("/pajangin/moderasi");

  // Kalau belum login dan mencoba buka halaman dashboard/admin, lempar
  // ke login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    // Simpan tujuan awal, biar abis login langsung balik ke sini.
    url.search = "?next=" + encodeURIComponent(pathname + search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/akun/:path*", "/pajangin/dashboard/:path*", "/pajangin/moderasi/:path*"],
};
