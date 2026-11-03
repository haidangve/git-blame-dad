import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/supabase/env";

// Refreshes the Supabase session cookie on every page load. Nothing here
// blocks a request: the game is open to guests, and the pages that need an
// account (/me) redirect on their own.
export async function middleware(request: NextRequest) {
  if (!supabaseEnv) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // /auth/callback is skipped so nothing touches the PKCE verifier before the
  // code exchange reads it.
  matcher: ["/((?!_next/static|_next/image|auth/callback|icon.svg|photos/|.*\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
