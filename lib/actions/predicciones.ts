"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PrediccionInput = {
  partido_id: string;
  goles_local: number;
  goles_visitante: number;
};

export type GuardarResult =
  | { ok: true; guardadas: number }
  | { ok: false; error: string };

export async function guardarPredicciones(
  predicciones: PrediccionInput[]
): Promise<GuardarResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Debes iniciar sesión para guardar predicciones." };
  }

  // Filtrar solo predicciones con valores válidos
  const validas = predicciones.filter(
    (p) =>
      p.goles_local >= 0 &&
      p.goles_visitante >= 0 &&
      Number.isInteger(p.goles_local) &&
      Number.isInteger(p.goles_visitante)
  );

  if (validas.length === 0) {
    return { ok: false, error: "No hay predicciones válidas para guardar." };
  }

  // Verificar que los partidos no estén bloqueados (fecha_hora <= ahora)
  const { data: partidos, error: errPartidos } = await supabase
    .from("partidos")
    .select("id, fecha_hora, estatus")
    .in(
      "id",
      validas.map((p) => p.partido_id)
    );

  if (errPartidos) {
    return { ok: false, error: "Error al verificar los partidos." };
  }

  const ahora = new Date();
  const partidosAbiertos = new Set(
    (partidos ?? [])
      .filter(
        (p) =>
          new Date(p.fecha_hora) > ahora && p.estatus === "programado"
      )
      .map((p) => p.id)
  );

  const prediccionesPermitidas = validas.filter((p) =>
    partidosAbiertos.has(p.partido_id)
  );

  if (prediccionesPermitidas.length === 0) {
    return {
      ok: false,
      error: "Todos los partidos seleccionados ya están bloqueados.",
    };
  }

  // Upsert: una predicción por usuario por partido
  const rows = prediccionesPermitidas.map((p) => ({
    usuario_id: user.id,
    partido_id: p.partido_id,
    goles_local: p.goles_local,
    goles_visitante: p.goles_visitante,
  }));

  const { error: errUpsert } = await supabase
    .from("predicciones")
    .upsert(rows, { onConflict: "usuario_id,partido_id" });

  if (errUpsert) {
    return { ok: false, error: "Error al guardar. Intenta de nuevo." };
  }

  revalidatePath("/dashboard/predicciones");
  return { ok: true, guardadas: prediccionesPermitidas.length };
}

// ── Carga partidos de la jornada activa con la predicción del usuario ──
export async function cargarJornadaActiva() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jornada activa de la temporada activa
  const { data: jornada } = await supabase
    .from("jornadas")
    .select(
      `id, numero, nombre, fecha_cierre,
       temporadas!inner(nombre, liga, activa)`
    )
    .eq("temporadas.activa", true)
    .eq("cerrada", false)
    .order("numero", { ascending: true })
    .limit(1)
    .single();

  if (!jornada) return { jornada: null, partidos: [] };

  // Partidos de esa jornada
  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, equipo_local, equipo_visitante, logo_local_url, logo_visitante_url, fecha_hora, estatus, goles_local_real, goles_visitante_real")
    .eq("jornada_id", jornada.id)
    .order("fecha_hora", { ascending: true });

  if (!partidos?.length) return { jornada, partidos: [] };

  // Predicciones existentes del usuario
  let prediccionesMap: Record<string, { goles_local: number; goles_visitante: number }> = {};

  if (user) {
    const { data: preds } = await supabase
      .from("predicciones")
      .select("partido_id, goles_local, goles_visitante")
      .eq("usuario_id", user.id)
      .in(
        "partido_id",
        partidos.map((p) => p.id)
      );

    prediccionesMap = Object.fromEntries(
      (preds ?? []).map((p) => [
        p.partido_id,
        { goles_local: p.goles_local, goles_visitante: p.goles_visitante },
      ])
    );
  }

  const ahora = new Date();

  const partidosConEstado = partidos.map((p) => ({
    ...p,
    bloqueado:
      new Date(p.fecha_hora) <= ahora || p.estatus !== "programado",
    prediccion: prediccionesMap[p.id] ?? null,
  }));

  return { jornada, partidos: partidosConEstado };
}
