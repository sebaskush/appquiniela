import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { cargarLeaderboard } from "@/lib/actions/leaderboard";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";

export const metadata: Metadata = {
  title: "Posiciones | World Cup 2026",
  description: "Tabla de posiciones general del torneo.",
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ jornada?: string }>;
};

export default async function PosicionesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params    = await searchParams;
  const jornadaId = params.jornada;

  const data = await cargarLeaderboard(jornadaId);

  return <LeaderboardClient data={data} />;
}
