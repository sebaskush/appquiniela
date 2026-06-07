"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Tipos ─────────────────────────────────────────────────────
export type ResultadoInput = {
  partido_id: string;
  goles_local: number;
  goles_visitante: number;
};

export type AdminResult =
  | { ok: true; mensaje: string; stats?: LiquidacionStats }
  | { ok: false; error: string };

export type LiquidacionStats = {
  total_predicciones: number;
  exactos: number;       // 3 pts
  resultado_ok: number;  // 1 pt
  fallidos: number;      // 0 pts
};

// ── Verificar que el usuario es admin ─────────────────────────
async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, supabase, user: null };

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  return {
    ok: perfil?.rol === "admin",
    supabase,
    user,
  };
}

// ── Calcular puntos ───────────────────────────────────────────
function calcularPuntos(
  predL: number, predV: number,
  realL: number, realV: number
): number {
  // Marcador exacto
  if (predL === realL && predV === realV) return 3;

  // Solo resultado (G/E/P)
  const resultadoPred =
    predL > predV ? "L" : predL < predV ? "V" : "E";
  const resultadoReal =
    realL > realV ? "L" : realL < realV ? "V" : "E";

  if (resultadoPred === resultadoReal) return 1;

  return 0;
}

// ── Acción principal: guardar resultado y liquidar ────────────
export async function guardarResultadoAction(
  data: ResultadoInput
): Promise<AdminResult> {
  const { ok, supabase } = await verificarAdmin();
  if (!ok) return { ok: false, error: "No tienes permisos de administrador." };

  const { partido_id, goles_local, goles_visitante } = data;

  // 1. Calcular resultado (L/E/V)
  const resultado =
    goles_local > goles_visitante ? "local" :
    goles_local < goles_visitante ? "visitante" : "empate";

  // 2. Actualizar partido con resultado real
  const { error: errPartido } = await supabase
    .from("partidos")
    .update({
      goles_local_real:     goles_local,
      goles_visitante_real: goles_visitante,
      resultado,
      estatus: "finalizado",
    })
    .eq("id", partido_id);

  if (errPartido) {
    return { ok: false, error: `Error al guardar resultado: ${errPartido.message}` };
  }

  // 3. Obtener todas las predicciones de este partido
  const { data: predicciones, error: errPreds } = await supabase
    .from("predicciones")
    .select("id, usuario_id, goles_local, goles_visitante")
    .eq("partido_id", partido_id);

  if (errPreds) {
    return { ok: false, error: "Error al obtener predicciones." };
  }

  if (!predicciones || predicciones.length === 0) {
    revalidatePath("/admin/partidos");
    return { ok: true, mensaje: "Resultado guardado. No había predicciones para este partido.", stats: { total_predicciones: 0, exactos: 0, resultado_ok: 0, fallidos: 0 } };
  }

  // 4. Calcular y actualizar puntos para cada predicción
  let exactos = 0, resultado_ok = 0, fallidos = 0;

  const updates = predicciones.map((pred) => {
    const puntos = calcularPuntos(
      pred.goles_local, pred.goles_visitante,
      goles_local, goles_visitante
    );
    if (puntos === 3) exactos++;
    else if (puntos === 1) resultado_ok++;
    else fallidos++;

    return { id: pred.id, puntos_obtenidos: puntos };
  });

  // Upsert en lotes
  for (const upd of updates) {
    await supabase
      .from("predicciones")
      .update({ puntos_obtenidos: upd.puntos_obtenidos })
      .eq("id", upd.id);
  }

  // 5. Obtener jornada y temporada del partido
  const { data: partido } = await supabase
    .from("partidos")
    .select("jornada_id, jornadas(temporada_id)")
    .eq("id", partido_id)
    .single();

  const jornada_id   = partido?.jornada_id;
  const temporada_id = (partido?.jornadas as any)?.temporada_id;

  // 6. Recalcular posiciones por jornada
  if (jornada_id && temporada_id) {
    // Agrupar puntos por usuario en esta jornada
    const { data: puntosJornada } = await supabase
      .from("predicciones")
      .select(`
        usuario_id,
        puntos_obtenidos,
        partidos!inner(jornada_id)
      `)
      .eq("partidos.jornada_id", jornada_id)
      .not("puntos_obtenidos", "is", null);

    if (puntosJornada) {
      // Agrupar por usuario
      const porUsuario: Record<string, {
        puntos: number; exactos: number; resultados: number; total: number;
      }> = {};

      for (const p of puntosJornada) {
        if (!porUsuario[p.usuario_id]) {
          porUsuario[p.usuario_id] = { puntos: 0, exactos: 0, resultados: 0, total: 0 };
        }
        porUsuario[p.usuario_id].puntos    += p.puntos_obtenidos ?? 0;
        porUsuario[p.usuario_id].total     += 1;
        if (p.puntos_obtenidos === 3) porUsuario[p.usuario_id].exactos++;
        if ((p.puntos_obtenidos ?? 0) >= 1) porUsuario[p.usuario_id].resultados++;
      }

      // Upsert posiciones por jornada
      for (const [usuario_id, stats] of Object.entries(porUsuario)) {
        await supabase
          .from("posiciones")
          .upsert({
            usuario_id,
            temporada_id,
            jornada_id,
            puntos_jornada:          stats.puntos,
            puntos_acumulados:       stats.puntos, // se recalcula abajo
            aciertos_exactos:        stats.exactos,
            aciertos_resultado:      stats.resultados,
            predicciones_realizadas: stats.total,
            ultima_actualizacion:    new Date().toISOString(),
          }, { onConflict: "usuario_id,temporada_id,jornada_id" });
      }

      // Recalcular acumulado de temporada (jornada_id = null)
      const { data: todasPosiciones } = await supabase
        .from("posiciones")
        .select("usuario_id, puntos_jornada, aciertos_exactos, aciertos_resultado, predicciones_realizadas")
        .eq("temporada_id", temporada_id)
        .not("jornada_id", "is", null);

      if (todasPosiciones) {
        const acumulado: Record<string, {
          puntos: number; exactos: number; resultados: number; total: number;
        }> = {};

        for (const pos of todasPosiciones) {
          if (!acumulado[pos.usuario_id]) {
            acumulado[pos.usuario_id] = { puntos: 0, exactos: 0, resultados: 0, total: 0 };
          }
          acumulado[pos.usuario_id].puntos    += pos.puntos_jornada ?? 0;
          acumulado[pos.usuario_id].exactos   += pos.aciertos_exactos ?? 0;
          acumulado[pos.usuario_id].resultados += pos.aciertos_resultado ?? 0;
          acumulado[pos.usuario_id].total     += pos.predicciones_realizadas ?? 0;
        }

        for (const [usuario_id, stats] of Object.entries(acumulado)) {
          await supabase
            .from("posiciones")
            .upsert({
              usuario_id,
              temporada_id,
              jornada_id:              null,
              puntos_jornada:          0,
              puntos_acumulados:       stats.puntos,
              aciertos_exactos:        stats.exactos,
              aciertos_resultado:      stats.resultados,
              predicciones_realizadas: stats.total,
              ultima_actualizacion:    new Date().toISOString(),
            }, { onConflict: "usuario_id,temporada_id,jornada_id" });
        }

        // Actualizar posicion_global por ranking
        const { data: ranking } = await supabase
          .from("posiciones")
          .select("id, puntos_acumulados")
          .eq("temporada_id", temporada_id)
          .is("jornada_id", null)
          .order("puntos_acumulados", { ascending: false });

        if (ranking) {
          for (let i = 0; i < ranking.length; i++) {
            await supabase
              .from("posiciones")
              .update({ posicion_global: i + 1 })
              .eq("id", ranking[i].id);
          }
        }
      }
    }
  }

  revalidatePath("/admin/partidos");
  revalidatePath("/dashboard/predicciones");
  revalidatePath("/dashboard/posiciones");

  return {
    ok: true,
    mensaje: `✓ Resultado guardado y ${predicciones.length} predicciones liquidadas`,
    stats: {
      total_predicciones: predicciones.length,
      exactos,
      resultado_ok,
      fallidos,
    },
  };
}

// ── Cargar partidos para el panel admin ───────────────────────
export async function cargarPartidosAdmin(jornada_id?: string) {
  const { ok, supabase } = await verificarAdmin();
  if (!ok) return { ok: false, partidos: [], jornadas: [] };

  // Todas las jornadas de temporadas activas
  const { data: jornadas } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, temporadas!inner(nombre, activa)")
    .eq("temporadas.activa", true)
    .order("numero");

  // Partidos de la jornada seleccionada (o la primera)
  const jornadaTarget = jornada_id ?? jornadas?.[0]?.id;
  if (!jornadaTarget) return { ok: true, partidos: [], jornadas: jornadas ?? [] };

  const { data: partidos } = await supabase
    .from("partidos")
    .select(`
      id, equipo_local, equipo_visitante,
      fecha_hora, estatus,
      goles_local_real, goles_visitante_real, resultado,
      jornada_id
    `)
    .eq("jornada_id", jornadaTarget)
    .order("fecha_hora");

  // Contar predicciones por partido
  const ids = (partidos ?? []).map((p) => p.id);
  const { data: conteos } = await supabase
    .from("predicciones")
    .select("partido_id")
    .in("partido_id", ids);

  const conteoMap: Record<string, number> = {};
  for (const c of conteos ?? []) {
    conteoMap[c.partido_id] = (conteoMap[c.partido_id] ?? 0) + 1;
  }

  const partidosConConteo = (partidos ?? []).map((p) => ({
    ...p,
    total_predicciones: conteoMap[p.id] ?? 0,
  }));

  return {
    ok: true,
    partidos: partidosConConteo,
    jornadas: jornadas ?? [],
    jornadaActual: jornadaTarget,
  };
}

// ── Hacer admin a un usuario por email ────────────────────────
export async function hacerAdminAction(email: string): Promise<AdminResult> {
  const { ok, supabase } = await verificarAdmin();
  if (!ok) return { ok: false, error: "No tienes permisos." };

  const { error } = await supabase
    .from("usuarios")
    .update({ rol: "admin" })
    .eq("email", email);

  if (error) return { ok: false, error: error.message };
  return { ok: true, mensaje: `Usuario ${email} ahora es admin.` };
}
