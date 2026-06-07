import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { cargarJornadaActiva } from "@/lib/actions/predicciones";
import { PrediccionesClient } from "@/components/predicciones/PrediccionesClient";

export const metadata: Metadata = {
  title: "Mis Predicciones | World Cup 2026",
  description: "Ingresa tus pronósticos para la jornada actual.",
};

// Revalidar cada 60s para mantener estados de partido actualizados
export const revalidate = 60;

export default async function PrediccionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/predicciones");

  const { jornada, partidos } = await cargarJornadaActiva();

  if (!jornada) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07090E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: "rgba(238,242,255,0.4)",
          fontFamily: "'Barlow', sans-serif",
          fontSize: 14,
          textAlign: "center",
          padding: 24,
        }}
      >
        <span style={{ fontSize: 48 }}>🏆</span>
        <p style={{ margin: 0 }}>No hay una temporada activa en este momento.</p>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>
          Contacta al administrador para activar la temporada.
        </p>
      </div>
    );
  }

  return (
    <PrediccionesClient
      jornada={jornada}
      partidos={partidos}
    />
  );
}
