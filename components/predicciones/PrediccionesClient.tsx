"use client";

import { useState, useTransition, useMemo } from "react";
import { PartidoCard } from "@/components/predicciones/PartidoCard";
import { guardarPredicciones } from "@/lib/actions/predicciones";

type Partido = {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  logo_local_url: string | null;
  logo_visitante_url: string | null;
  fecha_hora: string;
  estatus: string;
  goles_local_real: number | null;
  goles_visitante_real: number | null;
  bloqueado: boolean;
  prediccion: { goles_local: number; goles_visitante: number } | null;
};

type Jornada = {
  id: string;
  numero: number;
  nombre: string | null;
  fecha_cierre: string;
};

type Props = {
  jornada: Jornada;
  partidos: Partido[];
};

type ValoresMap = Record<string, { local: string; visitante: string }>;

export function PrediccionesClient({ jornada, partidos }: Props) {
  // Inicializar con predicciones existentes
  const inicial: ValoresMap = Object.fromEntries(
    partidos.map((p) => [
      p.id,
      {
        local:     p.prediccion?.goles_local.toString()     ?? "",
        visitante: p.prediccion?.goles_visitante.toString() ?? "",
      },
    ])
  );

  const [valores, setValores] = useState<ValoresMap>(inicial);
  const [toast, setToast]     = useState<{ tipo: "ok" | "error"; msg: string } | null>(null);
  const [isPending, start]    = useTransition();

  function handleChange(id: string, campo: "local" | "visitante", valor: string) {
    setValores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  }

  // Contar cuántos partidos abiertos tienen predicción completa
  const stats = useMemo(() => {
    const abiertos  = partidos.filter((p) => !p.bloqueado);
    const completos = abiertos.filter((p) => {
      const v = valores[p.id];
      return v?.local !== "" && v?.visitante !== "";
    });
    return { abiertos: abiertos.length, completos: completos.length };
  }, [partidos, valores]);

  function mostrarToast(tipo: "ok" | "error", msg: string) {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function handleGuardar() {
    const payload = partidos
      .filter((p) => !p.bloqueado)
      .map((p) => ({
        partido_id:      p.id,
        goles_local:     parseInt(valores[p.id]?.local     ?? "-1", 10),
        goles_visitante: parseInt(valores[p.id]?.visitante ?? "-1", 10),
      }))
      .filter((p) => p.goles_local >= 0 && p.goles_visitante >= 0);

    if (payload.length === 0) {
      mostrarToast("error", "Ingresa al menos un pronóstico antes de guardar.");
      return;
    }

    start(async () => {
      const res = await guardarPredicciones(payload);
      if (res.ok) {
        mostrarToast("ok", `✓ ${res.guardadas} pronóstico${res.guardadas !== 1 ? "s" : ""} guardado${res.guardadas !== 1 ? "s" : ""} correctamente`);
      } else {
        mostrarToast("error", res.error);
      }
    });
  }

  const pct = stats.abiertos > 0 ? Math.round((stats.completos / stats.abiertos) * 100) : 0;

  return (
    <div className="pred-root">
      <style>{CSS}</style>

      {/* ── Header de jornada ── */}
      <div className="pred-hero">
        <div className="pred-hero-bg" aria-hidden />
        <div className="pred-hero-content">
          <div className="jornada-eyebrow">
            <span className="jornada-dot jornada-dot--green" />
            <span className="jornada-dot jornada-dot--blue" />
            <span className="jornada-dot jornada-dot--red" />
            WORLD CUP 2026
          </div>
          <h1 className="jornada-title">
            {jornada.nombre ?? `Jornada ${jornada.numero}`}
          </h1>
          <p className="jornada-cierre">
            Cierre: {new Date(jornada.fecha_cierre).toLocaleString("es-MX", {
              weekday: "long", day: "numeric", month: "long",
              hour: "2-digit", minute: "2-digit"
            })}
          </p>

          {/* Barra de progreso */}
          {stats.abiertos > 0 && (
            <div className="progress-wrap">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="progress-label">
                {stats.completos}/{stats.abiertos} pronósticos
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Lista de partidos ── */}
      <div className="pred-list">
        {partidos.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 40 }}>⚽</span>
            <p>No hay partidos programados para esta jornada.</p>
          </div>
        ) : (
          partidos.map((p) => (
            <PartidoCard
              key={p.id}
              partido={p}
              localVal={valores[p.id]?.local ?? ""}
              visitanteVal={valores[p.id]?.visitante ?? ""}
              onChange={handleChange}
            />
          ))
        )}
      </div>

      {/* ── Botón guardar ── */}
      {stats.abiertos > 0 && (
        <div className="pred-footer">
          <button
            className={`btn-save ${isPending ? "btn-save--loading" : ""} ${stats.completos === 0 ? "btn-save--dim" : ""}`}
            onClick={handleGuardar}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="btn-spinner" />
                Guardando…
              </>
            ) : (
              <>
                <SaveIcon />
                Guardar {stats.completos > 0 ? `${stats.completos} pronóstico${stats.completos !== 1 ? "s" : ""}` : "pronósticos"}
              </>
            )}
          </button>
          <p className="pred-footer-note">
            Solo se guardan los partidos que aún no han comenzado
          </p>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast--${toast.tipo}`}>
          {toast.tipo === "ok" ? <CheckCircleIcon /> : <AlertIcon />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

/* ── Iconos ── */
function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');

  :root {
    --green: #00E676;
    --blue:  #2979FF;
    --red:   #FF1744;
    --bg:    #07090E;
    --bg2:   #0C1018;
    --bg3:   #111620;
    --card:  rgba(255,255,255,0.03);
    --border:rgba(255,255,255,0.07);
    --text:  #EEF2FF;
    --muted: rgba(238,242,255,0.45);
    --hud:   'Barlow Condensed', sans-serif;
    --body:  'Barlow', sans-serif;
  }

  .pred-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--body);
    color: var(--text);
    padding-bottom: 120px;
  }

  /* ── Hero ── */
  .pred-hero {
    position: relative;
    overflow: hidden;
    padding: 32px 20px 28px;
  }
  .pred-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 100% 120% at 50% 0%, #0a1422 0%, var(--bg) 70%);
    background-image:
      radial-gradient(ellipse 100% 120% at 50% 0%, #0a1422 0%, transparent 70%),
      linear-gradient(rgba(41,121,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(41,121,255,.025) 1px, transparent 1px);
    background-size: auto, 28px 28px, 28px 28px;
  }
  .pred-hero-content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }

  .jornada-eyebrow {
    display: flex; align-items: center; gap: 6px;
    font-family: var(--hud); font-size: 10px; font-weight: 700;
    letter-spacing: .28em; color: var(--muted); text-transform: uppercase;
    margin-bottom: 8px;
  }
  .jornada-dot { width: 6px; height: 6px; border-radius: 50%; }
  .jornada-dot--green { background: var(--green); }
  .jornada-dot--blue  { background: var(--blue); }
  .jornada-dot--red   { background: var(--red); }

  .jornada-title {
    font-family: var(--hud); font-size: 34px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .03em; line-height: 1;
    margin: 0 0 6px;
    background: linear-gradient(90deg, #fff 0%, rgba(238,242,255,0.7) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .jornada-cierre {
    font-size: 12px; color: var(--muted); margin: 0 0 16px;
    text-transform: capitalize;
  }

  /* Barra de progreso */
  .progress-wrap {
    display: flex; align-items: center; gap: 12px;
    margin-top: 4px;
  }
  .progress-bar-bg {
    flex: 1; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, var(--green), var(--blue));
    transition: width .5s ease;
  }
  .progress-label {
    font-family: var(--hud); font-size: 11px; font-weight: 700;
    color: var(--muted); white-space: nowrap; letter-spacing: .05em;
  }

  /* ── Lista ── */
  .pred-list {
    max-width: 600px; margin: 0 auto;
    padding: 16px 16px 0;
    display: flex; flex-direction: column; gap: 12px;
  }

  /* ── Tarjeta de partido ── */
  .partido-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color .2s, box-shadow .2s;
  }
  .partido-card:not(.partido-card--locked):hover {
    border-color: rgba(41,121,255,0.25);
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  .partido-card--locked {
    opacity: 0.75;
  }
  .partido-card--filled {
    border-color: rgba(0,230,118,0.2);
  }

  .partido-bar {
    height: 2px;
    background: linear-gradient(90deg, var(--green) 0%, var(--blue) 50%, var(--red) 100%);
    opacity: 0.6;
  }
  .partido-card--locked .partido-bar {
    background: rgba(255,255,255,0.15);
  }

  /* Header */
  .partido-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px 6px;
    border-bottom: 1px solid var(--border);
  }
  .partido-fecha { display: flex; align-items: center; gap: 8px; }
  .partido-fecha-dia {
    font-family: var(--hud); font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .1em; color: var(--muted);
  }
  .partido-fecha-hora {
    font-family: var(--hud); font-size: 12px; font-weight: 800;
    color: var(--text); letter-spacing: .05em;
  }

  /* Countdown */
  .countdown {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--hud); font-size: 11px; font-weight: 700;
    letter-spacing: .06em;
    color: var(--green);
  }
  .countdown--urgent { color: var(--red); animation: pulse-text 1s ease-in-out infinite; }
  .countdown--locked { color: var(--muted); }
  .countdown-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor;
    animation: blink 1.2s ease-in-out infinite;
  }
  .countdown--locked .countdown-dot { animation: none; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes pulse-text { 0%,100%{opacity:1} 50%{opacity:0.6} }

  /* Body */
  .partido-body {
    display: flex; align-items: center;
    padding: 16px 14px;
    gap: 8px;
  }

  /* Equipo */
  .team-block {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .team-block--local  { align-items: center; }
  .team-block--visitante { align-items: center; }
  .team-escudo {
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
  }
  .team-initial {
    font-family: var(--hud); font-size: 22px; font-weight: 800;
    color: var(--muted);
  }
  .team-name {
    font-family: var(--hud); font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .08em;
    color: var(--text); text-align: center; line-height: 1.2;
  }

  /* Marcador */
  .partido-score { flex-shrink: 0; }

  /* Inputs activos */
  .score-inputs {
    display: flex; align-items: center; gap: 4px;
  }
  .score-input {
    width: 52px; height: 56px;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--hud); font-size: 28px; font-weight: 800;
    text-align: center;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .score-input::-webkit-outer-spin-button,
  .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .score-input:focus {
    border-color: var(--blue);
    background: rgba(41,121,255,0.08);
    box-shadow: 0 0 0 3px rgba(41,121,255,0.15);
  }
  .score-input:not(:placeholder-shown) {
    border-color: rgba(0,230,118,0.35);
    background: rgba(0,230,118,0.05);
  }
  .score-vsep {
    font-family: var(--hud); font-size: 20px; font-weight: 800;
    color: var(--muted); padding: 0 2px;
  }

  /* Bloqueado */
  .score-locked {
    position: relative;
    display: flex; align-items: center; gap: 4px;
    min-width: 120px; justify-content: center;
  }
  .score-real {
    font-family: var(--hud); font-size: 32px; font-weight: 800;
    color: var(--text); line-height: 1;
  }
  .score-pred {
    font-family: var(--hud); font-size: 28px; font-weight: 800;
    color: var(--blue); line-height: 1;
  }
  .score-sep {
    font-family: var(--hud); font-size: 22px; font-weight: 700;
    color: var(--muted); padding: 0 2px;
  }
  .score-sep--pred { color: var(--blue); opacity: 0.5; }
  .score-no-pred {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    color: var(--muted); font-size: 11px;
  }
  .lock-badge {
    position: absolute; top: -6px; right: -6px;
    width: 18px; height: 18px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted);
  }

  /* Footer de tarjeta */
  .partido-footer {
    padding: 8px 14px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center;
  }
  .estado {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 500;
  }
  .estado--locked { color: var(--muted); }
  .estado--saved  { color: var(--green); }
  .estado--open   { color: var(--blue); }

  /* ── Footer con botón ── */
  .pred-footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 12px 16px 20px;
    background: linear-gradient(to top, var(--bg) 60%, transparent);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    z-index: 50;
  }
  .btn-save {
    width: 100%; max-width: 600px;
    padding: 15px 24px;
    background: linear-gradient(135deg, var(--green) 0%, #00C853 100%);
    border: none; border-radius: 12px; cursor: pointer;
    font-family: var(--hud); font-size: 15px; font-weight: 800;
    letter-spacing: .1em; text-transform: uppercase;
    color: #04100A;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 24px rgba(0,230,118,0.3), 0 4px 16px rgba(0,0,0,0.5);
    transition: all .15s;
    position: relative; overflow: hidden;
  }
  .btn-save::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: translateX(-100%);
    transition: transform .4s;
  }
  .btn-save:hover:not(:disabled)::after { transform: translateX(100%); }
  .btn-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 0 32px rgba(0,230,118,0.45), 0 8px 20px rgba(0,0,0,0.5);
  }
  .btn-save:disabled { cursor: not-allowed; }
  .btn-save--dim { opacity: 0.5; }
  .btn-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(4,16,10,0.3);
    border-top-color: #04100A;
    animation: spin .7s linear infinite;
    display: inline-block; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pred-footer-note {
    font-size: 11px; color: rgba(255,255,255,0.2); text-align: center;
  }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 8px;
    padding: 12px 18px; border-radius: 12px;
    font-size: 13px; font-weight: 500; white-space: nowrap;
    z-index: 100;
    animation: toast-in .3s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  .toast--ok {
    background: rgba(0,230,118,0.12);
    border: 1px solid rgba(0,230,118,0.3);
    color: var(--green);
  }
  .toast--error {
    background: rgba(255,23,68,0.1);
    border: 1px solid rgba(255,23,68,0.25);
    color: #FF6B81;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Empty ── */
  .empty-state {
    text-align: center; padding: 48px 16px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    color: var(--muted); font-size: 14px;
  }

  /* ── Responsive ── */
  @media (max-width: 380px) {
    .team-name { font-size: 10px; }
    .score-input { width: 46px; height: 50px; font-size: 24px; }
    .jornada-title { font-size: 28px; }
  }
`;
