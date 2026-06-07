"use client";

import { useState } from "react";
import { PartidoAdminCard } from "@/components/admin/PartidoAdminCard";

type Jornada = { id: string; numero: number; nombre: string };
type Partido = {
  id: string; equipo_local: string; equipo_visitante: string;
  fecha_hora: string; estatus: string;
  goles_local_real: number | null; goles_visitante_real: number | null;
  resultado: string | null; total_predicciones: number;
};

type Props = {
  jornadas: Jornada[];
  partidos: Partido[];
  jornadaActual: string;
};

export function AdminPanelClient({ jornadas, partidos, jornadaActual }: Props) {
  const [jornadaId, setJornadaId] = useState(jornadaActual);

  const finalizados  = partidos.filter((p) => p.estatus === "finalizado").length;
  const pendientes   = partidos.filter((p) => p.estatus !== "finalizado").length;
  const totalPreds   = partidos.reduce((acc, p) => acc + p.total_predicciones, 0);

  return (
    <div className="ap-root">
      <style>{CSS}</style>

      {/* Header */}
      <div className="ap-hero">
        <div className="ap-hero-bg" />
        <div className="ap-hero-content">
          <div className="ap-eyebrow">
            <span className="ap-dot ap-dot--amber" />
            PANEL DE ADMINISTRADOR
          </div>
          <h1 className="ap-title">WORLD CUP <span>2026</span></h1>
          <p className="ap-subtitle">Ingresa los resultados reales para liquidar los puntos</p>

          {/* Stats */}
          <div className="ap-stats">
            <div className="ap-stat">
              <span className="ap-stat-num">{finalizados}</span>
              <span className="ap-stat-lbl">Finalizados</span>
            </div>
            <div className="ap-stat-div" />
            <div className="ap-stat">
              <span className="ap-stat-num ap-stat-num--amber">{pendientes}</span>
              <span className="ap-stat-lbl">Pendientes</span>
            </div>
            <div className="ap-stat-div" />
            <div className="ap-stat">
              <span className="ap-stat-num ap-stat-num--blue">{totalPreds}</span>
              <span className="ap-stat-lbl">Pronósticos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de jornada */}
      <div className="ap-jornada-wrap">
        <label className="ap-jornada-label">JORNADA</label>
        <div className="ap-jornada-pills">
          {jornadas.map((j) => (
            <a
              key={j.id}
              href={`/admin/partidos?jornada=${j.id}`}
              className={`ap-pill ${j.id === jornadaId ? "ap-pill--active" : ""}`}
            >
              {j.numero}
            </a>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="ap-list">
        {partidos.length === 0 ? (
          <div className="ap-empty">
            <span>📋</span>
            <p>No hay partidos en esta jornada.</p>
          </div>
        ) : (
          partidos.map((p) => (
            <PartidoAdminCard key={p.id} partido={p} />
          ))
        )}
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500&display=swap');
  :root {
    --amber:#F59E0B; --green:#00E676; --blue:#2979FF; --red:#FF1744;
    --bg:#07090E; --text:#EEF2FF; --muted:rgba(238,242,255,0.42);
    --hud:'Barlow Condensed',sans-serif; --body:'Barlow',sans-serif;
  }
  .ap-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--body); padding-bottom:48px; }

  /* Hero */
  .ap-hero { position:relative; overflow:hidden; padding:28px 16px 24px; }
  .ap-hero-bg {
    position:absolute; inset:0;
    background:radial-gradient(ellipse 110% 120% at 50% 0%,#150D00 0%,var(--bg) 70%);
  }
  .ap-hero-content { position:relative; z-index:1; max-width:600px; margin:0 auto; }
  .ap-eyebrow {
    display:flex; align-items:center; gap:6px;
    font-family:var(--hud); font-size:9px; font-weight:700;
    letter-spacing:.3em; color:var(--muted); text-transform:uppercase; margin-bottom:6px;
  }
  .ap-dot { width:5px; height:5px; border-radius:50%; }
  .ap-dot--amber { background:var(--amber); animation:blink 1.5s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  .ap-title {
    font-family:var(--hud); font-size:32px; font-weight:800;
    text-transform:uppercase; letter-spacing:.03em; line-height:1; margin:0 0 4px;
    color:var(--text);
  }
  .ap-title span { color:var(--amber); }
  .ap-subtitle { font-size:12px; color:var(--muted); margin:0 0 18px; }

  /* Stats */
  .ap-stats {
    display:flex; align-items:center; gap:16px;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:12px; padding:12px 16px; width:fit-content;
  }
  .ap-stat { display:flex; flex-direction:column; align-items:center; gap:2px; }
  .ap-stat-num {
    font-family:var(--hud); font-size:24px; font-weight:800; line-height:1; color:var(--green);
  }
  .ap-stat-num--amber { color:var(--amber); }
  .ap-stat-num--blue  { color:#93C5FD; }
  .ap-stat-lbl { font-family:var(--hud); font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:var(--muted); }
  .ap-stat-div { width:1px; height:28px; background:rgba(255,255,255,0.1); }

  /* Selector jornada */
  .ap-jornada-wrap { max-width:600px; margin:0 auto; padding:0 16px 12px; }
  .ap-jornada-label {
    font-family:var(--hud); font-size:9px; font-weight:700;
    letter-spacing:.25em; color:var(--muted); display:block; margin-bottom:8px;
  }
  .ap-jornada-pills { display:flex; flex-wrap:wrap; gap:6px; }
  .ap-pill {
    font-family:var(--hud); font-size:12px; font-weight:800; letter-spacing:.05em;
    padding:5px 12px; border-radius:20px;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    color:var(--muted); text-decoration:none; transition:all .15s;
  }
  .ap-pill:hover { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.3); color:var(--amber); }
  .ap-pill--active { background:rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.4); color:var(--amber); }

  /* Lista */
  .ap-list { max-width:600px; margin:0 auto; padding:4px 16px 0; display:flex; flex-direction:column; gap:10px; }
  .ap-empty { text-align:center; padding:48px 16px; display:flex; flex-direction:column; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
`;
