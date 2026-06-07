"use client";

import { useRouter } from "next/navigation";
import type { JugadorRanking, LeaderboardData } from "@/lib/actions/leaderboard";

export function LeaderboardClient({ data }: { data: LeaderboardData }) {
  const router  = useRouter();
  const { jugadores, mi_posicion, temporada, total_partidos, jornadas, jornada_actual } = data;

  const top3  = jugadores.slice(0, 3);
  const resto = jugadores.slice(3);

  function medalla(pos: number) {
    if (pos === 1) return { emoji: "🥇", color: "#FFD700", glow: "rgba(255,215,0,0.3)" };
    if (pos === 2) return { emoji: "🥈", color: "#C0C0C0", glow: "rgba(192,192,192,0.25)" };
    return           { emoji: "🥉", color: "#CD7F32", glow: "rgba(205,127,50,0.25)" };
  }

  function iniciales(nombre: string) {
    return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="lb-root">
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <div className="lb-hero">
        <div className="lb-hero-bg" />
        <div className="lb-hero-grid" />
        <div className="lb-glow-g" /><div className="lb-glow-b" /><div className="lb-glow-r" />
        <div className="lb-hero-c">
          <div className="lb-eyebrow">
            <span className="lb-dot" style={{ background: "#00E676" }} />
            <span className="lb-dot" style={{ background: "#2979FF" }} />
            <span className="lb-dot" style={{ background: "#FF1744" }} />
            WORLD CUP 2026
          </div>
          <h1 className="lb-title">TABLA DE<br /><span>POSICIONES</span></h1>
          <p className="lb-sub">{temporada} · {total_partidos} partido{total_partidos !== 1 ? "s" : ""} finalizado{total_partidos !== 1 ? "s" : ""}</p>

          {/* Mi posición */}
          {mi_posicion && (
            <div className="lb-mi-pos">
              <span className="lb-mi-label">TU POSICIÓN</span>
              <span className="lb-mi-num">#{mi_posicion}</span>
              <span className="lb-mi-label">de {jugadores.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filtro jornadas ── */}
      {jornadas.length > 0 && (
        <div className="lb-filter">
          <span className="lb-filter-label">VER</span>
          <div className="lb-pills">
            <button
              className={`lb-pill ${!jornada_actual ? "lb-pill--active" : ""}`}
              onClick={() => router.push("/dashboard/posiciones")}
            >
              General
            </button>
            {jornadas.map((j) => (
              <button
                key={j.id}
                className={`lb-pill ${jornada_actual === j.id ? "lb-pill--active" : ""}`}
                onClick={() => router.push(`/dashboard/posiciones?jornada=${j.id}`)}
              >
                J{j.numero}
              </button>
            ))}
          </div>
        </div>
      )}

      {jugadores.length === 0 ? (
        <div className="lb-empty">
          <span style={{ fontSize: 40 }}>🏆</span>
          <p>Aún no hay puntos registrados.</p>
          <p style={{ fontSize: 12, opacity: .6 }}>Los puntos aparecen después del primer partido finalizado.</p>
        </div>
      ) : (
        <>
          {/* ── Podio Top 3 ── */}
          {top3.length > 0 && (
            <div className="lb-podio">
              {/* Reordenar: 2° - 1° - 3° */}
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((j, idx) => {
                const orden = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const m = medalla(j.posicion);
                const altura = j.posicion === 1 ? "lb-podio-card--tall" : j.posicion === 2 ? "lb-podio-card--mid" : "";
                return (
                  <div key={j.usuario_id} className={`lb-podio-card ${altura} ${j.es_yo ? "lb-podio-card--yo" : ""}`}
                    style={{ "--medal-color": m.color, "--medal-glow": m.glow } as any}>
                    <div className="lb-podio-medal">{m.emoji}</div>
                    <div className="lb-podio-avatar">
                      {j.avatar_url
                        ? <img src={j.avatar_url} alt={j.nombre} className="lb-avatar-img" />
                        : <span className="lb-avatar-ini">{iniciales(j.nombre)}</span>
                      }
                      {j.es_yo && <div className="lb-yo-badge">TÚ</div>}
                    </div>
                    <span className="lb-podio-nombre">{j.nombre.split(" ")[0]}</span>
                    <span className="lb-podio-pts">{j.puntos_acumulados}<span className="lb-pts-label">pts</span></span>
                    <span className="lb-podio-exactos">⚽ {j.aciertos_exactos} exactos</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Tabla del resto ── */}
          {jugadores.length > 0 && (
            <div className="lb-tabla-wrap">
              <table className="lb-tabla">
                <thead>
                  <tr>
                    <th className="lb-th lb-th-pos">#</th>
                    <th className="lb-th lb-th-nombre">Jugador</th>
                    <th className="lb-th lb-th-num">⚽ Exactos</th>
                    <th className="lb-th lb-th-num">✓ Result.</th>
                    <th className="lb-th lb-th-pts">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadores.map((j, i) => (
                    <tr key={j.usuario_id}
                      className={`lb-tr ${j.es_yo ? "lb-tr--yo" : ""} ${j.posicion <= 3 ? "lb-tr--top3" : ""}`}
                      style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="lb-td lb-td-pos">
                        {j.posicion <= 3
                          ? <span className="lb-pos-medal">{medalla(j.posicion).emoji}</span>
                          : <span className="lb-pos-num">{j.posicion}</span>
                        }
                      </td>
                      <td className="lb-td lb-td-nombre">
                        <div className="lb-user">
                          <div className="lb-avatar-sm">
                            {j.avatar_url
                              ? <img src={j.avatar_url} alt={j.nombre} className="lb-avatar-sm-img" />
                              : <span>{iniciales(j.nombre)}</span>
                            }
                          </div>
                          <span className="lb-nombre-text">{j.nombre}</span>
                          {j.es_yo && <span className="lb-tu-tag">TÚ</span>}
                        </div>
                      </td>
                      <td className="lb-td lb-td-num">
                        <span className="lb-exactos">{j.aciertos_exactos}</span>
                      </td>
                      <td className="lb-td lb-td-num">
                        <span className="lb-resultado">{j.aciertos_resultado}</span>
                      </td>
                      <td className="lb-td lb-td-pts">
                        <span className="lb-puntos">{j.puntos_acumulados}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Leyenda */}
      <div className="lb-leyenda">
        <span>⚽ Marcador exacto = 3 pts</span>
        <span>✓ Solo resultado = 1 pt</span>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500&display=swap');
  :root {
    --green:#00E676; --blue:#2979FF; --red:#FF1744;
    --gold:#FFD700;  --silver:#C0C0C0; --bronze:#CD7F32;
    --bg:#07090E; --bg2:#0C1018; --card:rgba(255,255,255,0.03);
    --border:rgba(255,255,255,0.07); --text:#EEF2FF; --muted:rgba(238,242,255,0.42);
    --hud:'Barlow Condensed',sans-serif; --body:'Barlow',sans-serif;
  }
  .lb-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--body); padding-bottom:48px; }

  /* Hero */
  .lb-hero { position:relative; overflow:hidden; padding:28px 16px 22px; }
  .lb-hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 110% 120% at 50% 0%,#0a1020 0%,var(--bg) 70%); }
  .lb-hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(41,121,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(41,121,255,.025) 1px,transparent 1px); background-size:28px 28px; }
  .lb-glow-g { position:absolute; top:-40px; left:-20px; width:200px; height:160px; background:radial-gradient(ellipse,rgba(0,230,118,.06) 0%,transparent 70%); pointer-events:none; }
  .lb-glow-b { position:absolute; top:-40px; right:-20px; width:200px; height:160px; background:radial-gradient(ellipse,rgba(41,121,255,.05) 0%,transparent 70%); pointer-events:none; }
  .lb-glow-r { position:absolute; bottom:-20px; left:50%; transform:translateX(-50%); width:180px; height:120px; background:radial-gradient(ellipse,rgba(255,23,68,.04) 0%,transparent 70%); pointer-events:none; }
  .lb-hero-c { position:relative; z-index:1; max-width:600px; margin:0 auto; }
  .lb-eyebrow { display:flex; align-items:center; gap:5px; font-family:var(--hud); font-size:9px; font-weight:700; letter-spacing:.28em; color:var(--muted); text-transform:uppercase; margin-bottom:6px; }
  .lb-dot { width:5px; height:5px; border-radius:50%; }
  .lb-title { font-family:var(--hud); font-size:32px; font-weight:800; text-transform:uppercase; letter-spacing:.03em; line-height:1.05; margin:0 0 4px; background:linear-gradient(90deg,#fff,rgba(238,242,255,.7)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .lb-title span { background:linear-gradient(90deg,var(--green),var(--blue)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .lb-sub { font-size:12px; color:var(--muted); margin:0 0 14px; }

  /* Mi posición */
  .lb-mi-pos { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:6px 14px; }
  .lb-mi-label { font-family:var(--hud); font-size:9px; font-weight:700; letter-spacing:.2em; color:var(--muted); text-transform:uppercase; }
  .lb-mi-num { font-family:var(--hud); font-size:20px; font-weight:800; color:var(--green); line-height:1; }

  /* Filtro */
  .lb-filter { max-width:600px; margin:0 auto; padding:10px 16px 8px; display:flex; align-items:center; gap:10px; }
  .lb-filter-label { font-family:var(--hud); font-size:9px; font-weight:700; letter-spacing:.25em; color:var(--muted); text-transform:uppercase; white-space:nowrap; }
  .lb-pills { display:flex; flex-wrap:wrap; gap:5px; }
  .lb-pill { font-family:var(--hud); font-size:11px; font-weight:800; letter-spacing:.05em; padding:4px 11px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:var(--muted); cursor:pointer; transition:all .15s; }
  .lb-pill:hover { background:rgba(41,121,255,0.1); border-color:rgba(41,121,255,0.3); color:var(--blue); }
  .lb-pill--active { background:rgba(41,121,255,0.12); border-color:rgba(41,121,255,0.4); color:#93C5FD; }

  /* Podio */
  .lb-podio { max-width:600px; margin:12px auto 0; padding:0 16px; display:flex; align-items:flex-end; justify-content:center; gap:8px; }
  .lb-podio-card {
    flex:1; max-width:160px;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
    border-radius:14px; padding:14px 10px 12px;
    display:flex; flex-direction:column; align-items:center; gap:6px;
    transition:border-color .2s; position:relative; overflow:hidden;
    animation:lb-fade-up .5s ease both;
  }
  .lb-podio-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--medal-color); opacity:.7; }
  .lb-podio-card--tall { min-height:200px; box-shadow:0 0 30px var(--medal-glow); border-color:rgba(255,215,0,0.2); }
  .lb-podio-card--mid  { min-height:170px; }
  .lb-podio-card--yo   { border-color:rgba(0,230,118,0.3); }
  .lb-podio-medal { font-size:22px; line-height:1; }
  .lb-podio-avatar {
    width:52px; height:52px; border-radius:50%;
    background:rgba(255,255,255,0.06); border:2px solid var(--medal-color);
    display:flex; align-items:center; justify-content:center;
    position:relative; overflow:visible;
    box-shadow:0 0 14px var(--medal-glow);
  }
  .lb-avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
  .lb-avatar-ini { font-family:var(--hud); font-size:18px; font-weight:800; color:var(--text); }
  .lb-yo-badge {
    position:absolute; bottom:-6px; left:50%; transform:translateX(-50%);
    background:var(--green); color:#050E08;
    font-family:var(--hud); font-size:8px; font-weight:800; letter-spacing:.1em;
    padding:1px 5px; border-radius:10px; white-space:nowrap;
  }
  .lb-podio-nombre { font-family:var(--hud); font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--text); text-align:center; margin-top:2px; }
  .lb-podio-pts { font-family:var(--hud); font-size:26px; font-weight:800; color:var(--medal-color); line-height:1; }
  .lb-pts-label { font-size:11px; font-weight:600; opacity:.7; margin-left:2px; }
  .lb-podio-exactos { font-size:10px; color:var(--muted); }

  /* Tabla */
  .lb-tabla-wrap { max-width:600px; margin:14px auto 0; padding:0 16px; }
  .lb-tabla { width:100%; border-collapse:collapse; }
  .lb-th {
    font-family:var(--hud); font-size:9px; font-weight:700; letter-spacing:.2em;
    text-transform:uppercase; color:var(--muted);
    padding:8px 10px; text-align:left;
    border-bottom:1px solid rgba(255,255,255,0.07);
  }
  .lb-th-pos    { width:36px; text-align:center; }
  .lb-th-num    { width:72px; text-align:center; }
  .lb-th-pts    { width:64px; text-align:right; }
  .lb-tr {
    border-bottom:1px solid rgba(255,255,255,0.05);
    transition:background .15s;
    animation:lb-fade-up .4s ease both;
  }
  .lb-tr:hover { background:rgba(255,255,255,0.03); }
  .lb-tr--yo {
    background:rgba(0,230,118,0.05) !important;
    border-color:rgba(0,230,118,0.1);
  }
  .lb-tr--top3 { opacity:0.6; }
  .lb-td { padding:10px 10px; vertical-align:middle; }
  .lb-td-pos { text-align:center; }
  .lb-pos-medal { font-size:16px; }
  .lb-pos-num { font-family:var(--hud); font-size:14px; font-weight:800; color:var(--muted); }
  .lb-td-nombre {}
  .lb-user { display:flex; align-items:center; gap:9px; }
  .lb-avatar-sm {
    width:30px; height:30px; border-radius:50%; flex-shrink:0;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--hud); font-size:11px; font-weight:800; color:var(--muted);
    overflow:hidden;
  }
  .lb-avatar-sm-img { width:100%; height:100%; object-fit:cover; }
  .lb-nombre-text { font-size:13px; font-weight:500; color:var(--text); }
  .lb-tu-tag {
    font-family:var(--hud); font-size:8px; font-weight:800; letter-spacing:.1em;
    background:var(--green); color:#050E08;
    padding:2px 6px; border-radius:10px;
  }
  .lb-td-num { text-align:center; }
  .lb-exactos  { font-family:var(--hud); font-size:14px; font-weight:800; color:var(--green); }
  .lb-resultado { font-family:var(--hud); font-size:14px; font-weight:800; color:#93C5FD; }
  .lb-td-pts { text-align:right; }
  .lb-puntos { font-family:var(--hud); font-size:16px; font-weight:800; color:var(--text); }

  /* Leyenda */
  .lb-leyenda {
    max-width:600px; margin:16px auto 0; padding:0 16px;
    display:flex; gap:16px; flex-wrap:wrap;
    font-size:11px; color:var(--muted);
  }

  /* Empty */
  .lb-empty { text-align:center; padding:48px 16px; display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--muted); font-size:13px; }

  /* Animaciones */
  @keyframes lb-fade-up {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @media (max-width:380px) {
    .lb-title { font-size:26px; }
    .lb-podio-card { padding:10px 7px; }
    .lb-podio-pts { font-size:22px; }
    .lb-th-num, .lb-td-num { display:none; }
  }
`;
