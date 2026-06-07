import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { cargarPartidosAdmin } from "@/lib/actions/admin";
import { AdminPanelClient } from "@/components/admin/AdminPanelClient";

export const metadata: Metadata = {
  title: "Admin — Resultados | World Cup 2026",
};

export const revalidate = 0; // siempre fresco

type Props = {
  searchParams: Promise<{ jornada?: string }>;
};

export default async function AdminPartidosPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verificar sesión
  if (!user) redirect("/auth/login?redirectTo=/admin/partidos");

  // Verificar rol admin
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") {
    redirect("/dashboard");
  }

  const params    = await searchParams;
  const jornadaId = params.jornada;

  const datos = await cargarPartidosAdmin(jornadaId);

  if (!datos.ok || !datos.jornadas?.length) {
    return (
      <div style={{
        minHeight:"100vh", background:"#07090E",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        gap:16, color:"rgba(238,242,255,0.4)",
        fontFamily:"'Barlow',sans-serif", fontSize:14,
        textAlign:"center", padding:24,
      }}>
        <span style={{ fontSize:40 }}>⚙️</span>
        <p style={{ margin:0 }}>No hay temporadas activas.</p>
        <p style={{ margin:0, fontSize:12, opacity:.6 }}>
          Activa una temporada en Supabase para gestionar partidos.
        </p>
      </div>
    );
  }

  return (
    <AdminPanelClient
      jornadas={datos.jornadas as any}
      partidos={datos.partidos as any}
      jornadaActual={datos.jornadaActual ?? datos.jornadas[0].id}
    />
  );
}
