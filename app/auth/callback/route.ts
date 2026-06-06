import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code        = searchParams.get("code");
  const next        = searchParams.get("next") ?? "/dashboard";
  const redirectTo  = searchParams.get("redirectTo") ?? next;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sincronizar usuario de OAuth con tabla pública
      const meta = data.user.user_metadata;
      await supabase.from("usuarios").upsert({
        id:         data.user.id,
        email:      data.user.email,
        nombre:     meta?.full_name ?? meta?.name ?? "Usuario",
        avatar_url: meta?.avatar_url ?? meta?.picture ?? null,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
