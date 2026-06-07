"use client";

import { useState, useEffect } from "react";

type Countdown = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  bloqueado: boolean;
  texto: string;
};

export function useCountdown(fechaHora: string): Countdown {
  const calcular = (): Countdown => {
    const ahora = Date.now();
    const objetivo = new Date(fechaHora).getTime();
    const diff = objetivo - ahora;

    if (diff <= 0) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0, bloqueado: true, texto: "En curso / Finalizado" };
    }

    const dias     = Math.floor(diff / 86_400_000);
    const horas    = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutos  = Math.floor((diff % 3_600_000) / 60_000);
    const segundos = Math.floor((diff % 60_000) / 1_000);

    let texto = "";
    if (dias > 0)        texto = `${dias}d ${horas}h`;
    else if (horas > 0)  texto = `${horas}h ${minutos}m`;
    else                 texto = `${minutos}m ${segundos}s`;

    return { dias, horas, minutos, segundos, bloqueado: false, texto };
  };

  const [state, setState] = useState<Countdown>(calcular);

  useEffect(() => {
    const id = setInterval(() => setState(calcular()), 1_000);
    return () => clearInterval(id);
  }, [fechaHora]);

  return state;
}
