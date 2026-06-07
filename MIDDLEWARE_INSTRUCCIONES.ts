// Este archivo complementa tu middleware.ts existente.
// Agrega estas líneas dentro de la función middleware(),
// DESPUÉS de la verificación de rutas protegidas:

// ── Rutas de admin: requieren rol = 'admin' ──────────────────
// const adminPaths = ["/admin"];
// const isAdmin = adminPaths.some((p) => request.nextUrl.pathname.startsWith(p));
//
// if (isAdmin) {
//   if (!user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/auth/login";
//     url.searchParams.set("redirectTo", request.nextUrl.pathname);
//     return NextResponse.redirect(url);
//   }
//   // Verificar rol admin en tabla usuarios
//   const { data: perfil } = await supabase
//     .from("usuarios")
//     .select("rol")
//     .eq("id", user.id)
//     .single();
//
//   if (perfil?.rol !== "admin") {
//     const url = request.nextUrl.clone();
//     url.pathname = "/dashboard";
//     return NextResponse.redirect(url);
//   }
// }

// INSTRUCCIÓN: Copia el bloque de arriba (sin los // al inicio de cada línea)
// dentro de tu middleware.ts, justo después del bloque de "rutas protegidas".
// Asegúrate de que el matcher incluya /admin en la lista.
