import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Obtener datos del perfil público
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, avatar_url")
    .eq("id", user.id)
    .single();

  const nombre = perfil?.nombre ?? user.user_metadata?.full_name ?? "Jugador";

  return (
    <div className="min-h-screen bg-pitch-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-2xl">
          ⚽
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">¡Hola, {nombre}!</h1>
          <p className="text-white/40 text-sm mt-1">{user.email}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/4 p-4 text-left space-y-1">
          <p className="text-xs text-white/30 uppercase tracking-widest font-medium">Estado de sesión</p>
          <p className="text-sm text-brand-400 font-medium">✓ Autenticado correctamente</p>
          <p className="text-xs text-white/30 mt-1">Proveedor: {user.app_metadata?.provider ?? "email"}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white/60 hover:text-white transition-all"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
