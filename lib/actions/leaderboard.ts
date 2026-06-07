"use server";

import { createClient } from "@/lib/supabase/server";

export type JugadorRanking = {
  posicion:               number;
  usuario_id:             string;
  nombre:                 string;
  avatar_url:             string | null;
  puntos_acumulados:      number;
  aciertos_exactos:       number;
  aciertos_resultado:     number;
  predicciones_realizadas:number;
  es_yo:                  boolean;
};

export type LeaderboardData = {
  jugadores:      JugadorRanking[];
  mi_posicion:    number | null;
  temporada:      string;
  total_partidos: number;
  jornadas:       { id: string; numero: number; nombre: string }[];
  jornada_actual: string | null;
};

export async function cargarLeaderboard(jornada_id?: string): Promise<LeaderboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Temporada activa
  const { data: temporada } = await supabase
    .from("temporadas")
    .select("id, nombre")
    .eq("activa", true)
    .single();

  if (!temporada) {
    return { jugadores: [], mi_posicion: null, temporada: "", total_partidos: 0, jornadas: [], jornada_actual: null };
  }

  // Jornadas disponibles
  const { data: jornadas } = await supabase
    .from("jornadas")
    .select("id, numero, nombre")
    .eq("temporada_id", temporada.id)
    .order("numero");

  // Posiciones — si hay jornada filtra por ella, si no trae el acumulado (jornada_id IS NULL)
  let query = supabase
    .from("posiciones")
    .select("usuario_id, puntos_acumulados, puntos_jornada, aciertos_exactos, aciertos_resultado, predicciones_realizadas, posicion_global")
    .eq("temporada_id", temporada.id)
    .order("puntos_acumulados", { ascending: false });

  if (jornada_id) {
    query = query.eq("jornada_id", jornada_id);
  } else {
    query = query.is("jornada_id", null);
  }

  const { data: posiciones } = await query;

  if (!posiciones?.length) {
    return {
      jugadores: [],
      mi_posicion: null,
      temporada: temporada.nombre,
      total_partidos: 0,
      jornadas: jornadas ?? [],
      jornada_actual: jornada_id ?? null,
    };
  }

  // Obtener nombres y avatares
  const ids = posiciones.map((p) => p.usuario_id);
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre, avatar_url")
    .in("id", ids);

  const usuariosMap = Object.fromEntries(
    (usuarios ?? []).map((u) => [u.id, u])
  );

  // Total de partidos finalizados en la temporada
  const { count: total_partidos } = await supabase
    .from("partidos")
    .select("id", { count: "exact", head: true })
    .eq("estatus", "finalizado")
    .in("jornada_id",
      (jornadas ?? []).map((j) => j.id)
    );

  // Construir ranking
  const jugadores: JugadorRanking[] = posiciones.map((pos, i) => {
    const u = usuariosMap[pos.usuario_id];
    return {
      posicion:                pos.posicion_global ?? i + 1,
      usuario_id:              pos.usuario_id,
      nombre:                  u?.nombre ?? "Jugador",
      avatar_url:              u?.avatar_url ?? null,
      puntos_acumulados:       pos.puntos_acumulados ?? 0,
      aciertos_exactos:        pos.aciertos_exactos ?? 0,
      aciertos_resultado:      pos.aciertos_resultado ?? 0,
      predicciones_realizadas: pos.predicciones_realizadas ?? 0,
      es_yo:                   user?.id === pos.usuario_id,
    };
  });

  // Ordenar por puntos
  jugadores.sort((a, b) => b.puntos_acumulados - a.puntos_acumulados);
  jugadores.forEach((j, i) => { j.posicion = i + 1; });

  const mi_posicion = user
    ? jugadores.find((j) => j.es_yo)?.posicion ?? null
    : null;

  return {
    jugadores,
    mi_posicion,
    temporada: temporada.nombre,
    total_partidos: total_partidos ?? 0,
    jornadas: jornadas ?? [],
    jornada_actual: jornada_id ?? null,
  };
}
