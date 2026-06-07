"use client";

import { useState, useTransition } from "react";
import { guardarResultadoAction, type LiquidacionStats } from "@/lib/actions/admin";

type Partido = {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  fecha_hora: string;
  estatus: string;
  goles_local_real: number | null;
  goles_visitante_real: number | null;
  resultado: string | null;
  total_predicciones: number;
};

const EMOJI_FLAGS: Record<string, string> = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "Chequia": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia-Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🇬🇧",
  "USA": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
  "Alemania": "🇩🇪", "Curazao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudita": "🇸🇦", "Uruguay": "🇺🇾",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "Rep. D. del Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🇬🇧", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

type Toast = { tipo: "ok" | "error"; msg: string; stats?: LiquidacionStats };

export function PartidoAdminCard({ partido }: { partido: Partido }) {
  const yaFinalizado = partido.estatus === "finalizado";
  const [localVal, setLocalVal]   = useState(partido.goles_local_real?.toString() ?? "");
  const [visitVal, setVisitVal]   = useState(partido.goles_visitante_real?.toString() ?? "");
  const [toast, setToast]         = useState<Toast | null>(null);
  const [isPending, start]        = useTransition();
  const [guardado, setGuardado]   = useState(yaFinalizado);

  const flagL = EMOJI_FLAGS[partido.equipo_local]  ?? "🏳️";
  const flagV = EMOJI_FLAGS[partido.equipo_visitante] ?? "🏳️";

  const fecha = new Date(partido.fecha_hora);
  const fechaStr = fecha.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  const horaStr  = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  function mostrarToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 6000);
  }

  function handleGuardar() {
    const l = parseInt(localVal, 10);
    const v = parseInt(visitVal, 10);

    if (isNaN(l) || isNaN(v) || l < 0 || v < 0) {
      mostrarToast({ tipo: "error", msg: "Ingresa marcadores válidos (números >= 0)" });
      return;
    }

    start(async () => {
      const res = await guardarResultadoAction({
        partido_id:      partido.id,
        goles_local:     l,
        goles_visitante: v,
      });

      if (res.ok) {
        setGuardado(true);
        mostrarToast({ tipo: "ok", msg: res.mensaje, stats: res.stats });
      } else {
        mostrarToast({ tipo: "error", msg: res.error });
      }
    });
  }

  return (
    <div className={`admin-card ${guardado ? "admin-card--done" : ""}`}>
      <style>{CARD_CSS}</style>

      {/* Barra superior */}
      <div className={`admin-bar ${guardado ? "admin-bar--done" : ""}`} />

      {/* Header */}
      <div className="admin-card-head">
        <div className="admin-fecha">
          <span className="admin-fecha-dia">{fechaStr}</span>
          <span className="admin-fecha-hr">{horaStr} hrs</span>
        </div>
        <div className="admin-badges">
          <span className={`admin-badge admin-badge--${partido.estatus}`}>
            {partido.estatus === "finalizado" ? "✓ Finalizado" :
             partido.estatus === "en_curso"   ? "⚡ En curso"  :
             "Programado"}
          </span>
          <span className="admin-badge admin-badge--preds">
            {partido.total_predicciones} pronóstico{partido.total_predicciones !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="admin-body">
        {/* Equipo local */}
        <div className="admin-team">
          <span className="admin-flag">{flagL}</span>
          <span className="admin-team-name">{partido.equipo_local}</span>
        </div>

        {/* Inputs de marcador */}
        <div className="admin-score">
          {guardado ? (
            <div className="admin-score-final">
              <span className="admin-score-num">{partido.goles_local_real ?? localVal}</span>
              <span className="admin-score-sep">-</span>
              <span className="admin-score-num">{partido.goles_visitante_real ?? visitVal}</span>
            </div>
          ) : (
            <div className="admin-score-inputs">
              <input
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value.replace(/[^0-9]/g, "").slice(0,2))}
                placeholder="0"
                className="admin-input"
                aria-label={`Goles ${partido.equipo_local}`}
              />
              <span className="admin-score-vsep">-</span>
              <input
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={visitVal}
                onChange={(e) => setVisitVal(e.target.value.replace(/[^0-9]/g, "").slice(0,2))}
                placeholder="0"
                className="admin-input"
                aria-label={`Goles ${partido.equipo_visitante}`}
              />
            </div>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="admin-team admin-team--right">
          <span className="admin-flag">{flagV}</span>
          <span className="admin-team-name">{partido.equipo_visitante}</span>
        </div>
      </div>

      {/* Footer: botón o estado */}
      <div className="admin-footer">
        {guardado ? (
          <div className="admin-done-msg">
            <span>✓</span> Puntos liquidados correctamente
          </div>
        ) : (
          <button
            className="admin-btn-save"
            onClick={handleGuardar}
            disabled={isPending || localVal === "" || visitVal === ""}
          >
            {isPending ? (
              <><span className="admin-spinner" /> Liquidando puntos…</>
            ) : (
              <><SaveIcon /> Guardar resultado y liquidar puntos</>
            )}
          </button>
        )}
      </div>

      {/* Toast de resultado */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.tipo}`}>
          <div className="admin-toast-msg">
            {toast.tipo === "ok" ? "✓" : "✕"} {toast.msg}
          </div>
          {toast.stats && toast.stats.total_predicciones > 0 && (
            <div className="admin-toast-stats">
              <span className="ts-exactos">⚽ {toast.stats.exactos} exactos (3pts)</span>
              <span className="ts-resultado">✓ {toast.stats.resultado_ok} resultado (1pt)</span>
              <span className="ts-fallo">✕ {toast.stats.fallidos} fallos (0pts)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}

const CARD_CSS = `
  .admin-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color .2s;
  }
  .admin-card--done {
    border-color: rgba(0,230,118,0.2);
    opacity: 0.85;
  }
  .admin-bar { height: 2px; background: linear-gradient(90deg, #F59E0B, #D97706); }
  .admin-bar--done { background: linear-gradient(90deg, #00E676, #00C853); }

  .admin-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .admin-fecha { display: flex; align-items: center; gap: 8px; }
  .admin-fecha-dia { font-family: 'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(238,242,255,0.4); }
  .admin-fecha-hr  { font-family: 'Barlow Condensed',sans-serif; font-size:12px; font-weight:800; color:#EEF2FF; }
  .admin-badges { display:flex; gap:6px; }
  .admin-badge {
    font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase;
    padding: 3px 8px; border-radius:20px;
  }
  .admin-badge--programado { background:rgba(255,255,255,0.06); color:rgba(238,242,255,0.5); }
  .admin-badge--en_curso   { background:rgba(239,68,68,0.15); color:#FCA5A5; }
  .admin-badge--finalizado { background:rgba(0,230,118,0.1); color:#00E676; }
  .admin-badge--preds      { background:rgba(41,121,255,0.1); color:#93C5FD; }

  .admin-body {
    display: flex; align-items: center;
    padding: 16px 14px; gap: 8px;
  }
  .admin-team {
    flex: 1; display:flex; flex-direction:column;
    align-items:center; gap:6px;
  }
  .admin-team--right { align-items:center; }
  .admin-flag { font-size:30px; line-height:1; }
  .admin-team-name {
    font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700;
    text-transform:uppercase; letter-spacing:.07em;
    color:#EEF2FF; text-align:center; line-height:1.2;
  }

  /* Score inputs */
  .admin-score { flex-shrink:0; }
  .admin-score-inputs { display:flex; align-items:center; gap:4px; }
  .admin-input {
    width:54px; height:58px;
    background:rgba(245,158,11,0.06);
    border:1.5px solid rgba(245,158,11,0.25);
    border-radius:10px;
    color:#FEF3C7;
    font-family:'Barlow Condensed',sans-serif; font-size:28px; font-weight:800;
    text-align:center; outline:none;
    transition:all .2s;
    -moz-appearance:textfield; appearance:textfield;
  }
  .admin-input::-webkit-outer-spin-button,
  .admin-input::-webkit-inner-spin-button { -webkit-appearance:none; }
  .admin-input:focus {
    border-color:#F59E0B;
    background:rgba(245,158,11,0.1);
    box-shadow:0 0 0 3px rgba(245,158,11,0.15);
  }
  .admin-input:not(:placeholder-shown) { border-color:rgba(245,158,11,0.5); }
  .admin-score-vsep {
    font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800;
    color:rgba(238,242,255,0.3); padding:0 2px;
  }
  /* Score final */
  .admin-score-final {
    display:flex; align-items:center; gap:4px;
    min-width:120px; justify-content:center;
  }
  .admin-score-num {
    font-family:'Barlow Condensed',sans-serif; font-size:36px; font-weight:800;
    color:#00E676; line-height:1;
  }
  .admin-score-sep {
    font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700;
    color:rgba(238,242,255,0.3); padding:0 2px;
  }

  /* Footer */
  .admin-footer {
    padding:10px 14px 12px;
    border-top:1px solid rgba(255,255,255,0.06);
  }
  .admin-btn-save {
    width:100%; padding:11px;
    background:linear-gradient(135deg,#F59E0B,#D97706);
    border:none; border-radius:8px; cursor:pointer;
    font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:800;
    letter-spacing:.08em; text-transform:uppercase; color:#1C0A00;
    display:flex; align-items:center; justify-content:center; gap:7px;
    box-shadow:0 0 18px rgba(245,158,11,0.25),0 4px 12px rgba(0,0,0,0.4);
    transition:all .15s;
  }
  .admin-btn-save:hover:not(:disabled) {
    transform:translateY(-1px);
    box-shadow:0 0 28px rgba(245,158,11,0.4),0 8px 18px rgba(0,0,0,0.5);
  }
  .admin-btn-save:disabled { opacity:0.45; cursor:not-allowed; }
  .admin-done-msg {
    display:flex; align-items:center; justify-content:center; gap:6px;
    font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase; color:#00E676;
  }
  .admin-spinner {
    width:13px; height:13px; border-radius:50%;
    border:2px solid rgba(28,10,0,0.3); border-top-color:#1C0A00;
    animation:aspin .7s linear infinite; display:inline-block;
  }
  @keyframes aspin { to { transform:rotate(360deg); } }

  /* Toast */
  .admin-toast {
    margin:0 14px 12px;
    border-radius:10px; padding:10px 14px;
    animation:afadein .3s ease;
  }
  .admin-toast--ok  { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.2); }
  .admin-toast--error { background:rgba(255,23,68,0.08); border:1px solid rgba(255,23,68,0.2); }
  .admin-toast-msg {
    font-size:12px; font-weight:500;
    color: var(--c);
  }
  .admin-toast--ok   { --c:#00E676; }
  .admin-toast--error { --c:#FF6B81; }
  .admin-toast-stats {
    display:flex; gap:10px; flex-wrap:wrap;
    margin-top:8px;
  }
  .admin-toast-stats span {
    font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700;
    letter-spacing:.05em; padding:3px 8px; border-radius:20px;
  }
  .ts-exactos   { background:rgba(0,230,118,0.12); color:#00E676; }
  .ts-resultado { background:rgba(41,121,255,0.12); color:#93C5FD; }
  .ts-fallo     { background:rgba(255,23,68,0.1); color:#FF8099; }
  @keyframes afadein {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
