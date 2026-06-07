"use client";

import { useEffect, useState, type ReactNode } from "react";

export function AuthLayout({
  children,
  mode = "login",
}: {
  children: ReactNode;
  mode?: "login" | "register";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="auth-root">
      {/* ── Fondo ── */}
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-base" />
        <div className="bg-grid" />
        <div className="bg-glow-top" />
        <div className="bg-glow-bottom" />
        <PitchLines />
        <Particles />
      </div>

      {/* ── Contenido ── */}
      <main className={`auth-main ${mounted ? "is-mounted" : ""}`}>
        {/* Logo / marca */}
        <div className="brand">
          <div className="brand-icon">
            <BallIcon />
            <div className="brand-icon-ring" />
          </div>
          <div className="brand-text">
            <span className="brand-name">WORLD CUP</span>
            <span className="brand-sub">2026</span>
          </div>
        </div>

        {/* Tarjeta */}
        <div className="card">
          <div className="card-corner card-corner--tl" />
          <div className="card-corner card-corner--tr" />
          <div className="card-corner card-corner--bl" />
          <div className="card-corner card-corner--br" />
          <div className="card-top-bar" />
          <div className="card-body">{children}</div>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          Al continuar aceptas los{" "}
          <a href="/terminos">Términos de servicio</a> y{" "}
          <a href="/privacidad">Política de privacidad</a>
        </p>
      </main>

      <style>{CSS}</style>
    </div>
  );
}

/* ─── Iconos SVG inline ────────────────────────────────────── */
function BallIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      {/* base del trofeo */}
      <rect x="11" y="27" width="10" height="2" rx="1" fill="#2979FF" opacity="0.9"/>
      <rect x="9" y="29" width="14" height="2" rx="1" fill="#2979FF" opacity="0.7"/>
      {/* pedestal */}
      <rect x="14" y="23" width="4" height="4" rx="0.5" fill="#00E676" opacity="0.8"/>
      {/* copa */}
      <path d="M10 5 H22 L20 18 Q16 22 12 18 Z" fill="none" stroke="url(#trophy-grad)" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* asas */}
      <path d="M10 7 Q6 8 6 13 Q6 17 10 17" fill="none" stroke="#00E676" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M22 7 Q26 8 26 13 Q26 17 22 17" fill="none" stroke="#FF1744" strokeWidth="1.3" strokeLinecap="round"/>
      {/* estrella */}
      <path d="M16 9 L16.6 11H18.6L17 12.2L17.6 14.2L16 13L14.4 14.2L15 12.2L13.4 11H15.4Z" fill="#2979FF" opacity="0.9"/>
      <defs>
        <linearGradient id="trophy-grad" x1="10" y1="5" x2="22" y2="22">
          <stop offset="0%" stopColor="#00E676"/>
          <stop offset="50%" stopColor="#2979FF"/>
          <stop offset="100%" stopColor="#FF1744"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function PitchLines() {
  return (
    <svg className="pitch-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      {/* líneas de cancha */}
      <rect x="40" y="60" width="320" height="580" rx="4" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.12" />
      <line x1="40" y1="350" x2="360" y2="350" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.12" />
      <circle cx="200" cy="350" r="60" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.12" />
      <circle cx="200" cy="350" r="3" fill="#00FF87" fillOpacity="0.15" />
      {/* áreas */}
      <rect x="110" y="60" width="180" height="90" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.09" />
      <rect x="110" y="550" width="180" height="90" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.09" />
      <rect x="150" y="60" width="100" height="45" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.07" />
      <rect x="150" y="595" width="100" height="45" fill="none" stroke="#00FF87" strokeWidth="0.4" strokeOpacity="0.07" />
    </svg>
  );
}

function Particles() {
  const pts = [
    [10,15],[85,25],[20,70],[90,55],[5,45],[75,80],[40,10],[60,90],[30,60],[50,30],
  ];
  return (
    <div className="particles">
      {pts.map(([x, y], i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${i * 0.4}s`,
            width: i % 3 === 0 ? "3px" : "2px",
            height: i % 3 === 0 ? "3px" : "2px",
          }}
        />
      ))}
    </div>
  );
}

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');

  :root {
    --neon: #00E676;
    --neon-dim: rgba(0,230,118,0.15);
    --neon-glow: rgba(0,230,118,0.4);
    --blue: #2979FF;
    --red: #FF1744;
    --bg: #07090E;
    --bg2: #0C1018;
    --bg3: #111620;
    --surface: rgba(255,255,255,0.03);
    --border: rgba(41,121,255,0.13);
    --border-bright: rgba(0,230,118,0.35);
    --text: #EEF2FF;
    --muted: rgba(238,242,255,0.4);
    --danger: #FF1744;
    --font-hud: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
  }

  .auth-root {
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: var(--bg);
    font-family: var(--font-body);
  }

  /* ── Fondo ── */
  .bg-layer { position:absolute; inset:0; pointer-events:none; }
  .bg-base  { position:absolute; inset:0; background: radial-gradient(ellipse 80% 60% at 50% 20%, #0a1020 0%, var(--bg) 70%); }
  .bg-grid  {
    position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .bg-glow-top {
    position:absolute; top:-20%; left:40%; transform:translateX(-50%);
    width:500px; height:350px;
    background: radial-gradient(ellipse, rgba(0,230,118,0.05) 0%, transparent 70%);
  }
  .bg-glow-bottom {
    position:absolute; bottom:-10%; right:10%;
    width:400px; height:300px;
    background: radial-gradient(ellipse, rgba(255,23,68,0.04) 0%, transparent 70%);
  }
  .bg-glow-mid {
    position:absolute; top:40%; left:60%;
    width:300px; height:300px;
    background: radial-gradient(ellipse, rgba(41,121,255,0.04) 0%, transparent 70%);
  }
  .pitch-svg {
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover;
  }
  .particles { position:absolute; inset:0; }
  .particle {
    position:absolute; border-radius:50%;
    background: var(--neon); opacity:0;
    animation: particle-float 6s ease-in-out infinite;
  }
  @keyframes particle-float {
    0%,100% { opacity:0; transform:translateY(0); }
    30%      { opacity:0.4; }
    50%      { opacity:0.2; transform:translateY(-12px); }
  }

  /* ── Layout principal ── */
  .auth-main {
    position:relative; z-index:10;
    width:100%; max-width:420px;
    padding: 24px 16px 32px;
    display:flex; flex-direction:column; align-items:center; gap:20px;
    opacity:0; transform:translateY(20px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .auth-main.is-mounted { opacity:1; transform:translateY(0); }

  /* ── Brand ── */
  .brand {
    display:flex; align-items:center; gap:12px;
    animation: brand-in .5s .1s ease both;
  }
  @keyframes brand-in {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .brand-icon {
    position:relative; width:44px; height:44px;
    display:flex; align-items:center; justify-content:center;
  }
  .brand-icon-ring {
    position:absolute; inset:-4px; border-radius:50%;
    border:1px solid var(--neon);
    opacity:0.3; animation:ring-pulse 3s ease-in-out infinite;
  }
  @keyframes ring-pulse {
    0%,100% { transform:scale(1); opacity:0.3; }
    50%      { transform:scale(1.1); opacity:0.6; }
  }
  .brand-text { display:flex; flex-direction:column; }
  .brand-name {
    font-family:var(--font-hud); font-size:22px; font-weight:800;
    letter-spacing:0.12em; color:var(--text); line-height:1;
  }
  .brand-sub {
    font-family:var(--font-hud); font-size:11px; font-weight:800;
    letter-spacing:0.3em; line-height:1; margin-top:2px;
    background: linear-gradient(90deg, #00E676, #2979FF, #FF1744);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Tarjeta ── */
  .card {
    width:100%; position:relative;
    background: linear-gradient(145deg, rgba(20,26,21,0.95) 0%, rgba(10,14,11,0.98) 100%);
    border:1px solid var(--border);
    border-radius:16px;
    box-shadow: 0 0 0 1px rgba(0,255,135,0.04), 0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,135,0.04);
    overflow:hidden;
    animation: card-in .5s .2s ease both;
  }
  @keyframes card-in {
    from { opacity:0; transform:scale(0.97) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .card-top-bar {
    height:2px;
    background: linear-gradient(90deg, #00E676 0%, #2979FF 50%, #FF1744 100%);
    opacity:0.85;
  }
  .card-corner {
    position:absolute; width:12px; height:12px;
    border-color: var(--neon); border-style:solid; opacity:0.5;
    z-index:1;
  }
  .card-corner--tl { top:8px; left:8px; border-width:1px 0 0 1px; }
  .card-corner--tr { top:8px; right:8px; border-width:1px 1px 0 0; }
  .card-corner--bl { bottom:8px; left:8px; border-width:0 0 1px 1px; }
  .card-corner--br { bottom:8px; right:8px; border-width:0 1px 1px 0; }
  .card-body { padding:28px 24px 28px; }
  @media (min-width:400px) { .card-body { padding:32px 32px 32px; } }

  /* ── Card header ── */
  .card-header { margin-bottom:24px; }
  .card-eyebrow {
    font-family:var(--font-hud); font-size:10px; font-weight:700;
    letter-spacing:0.3em; color:var(--neon); text-transform:uppercase;
    display:flex; align-items:center; gap:8px; margin-bottom:6px;
  }
  .card-eyebrow::before {
    content:''; display:block; width:16px; height:1px; background:var(--neon);
  }
  .card-title {
    font-family:var(--font-hud); font-size:30px; font-weight:800;
    letter-spacing:0.02em; color:var(--text); line-height:1.1;
    text-transform:uppercase;
  }
  .card-title span { color:var(--neon); }
  .card-subtitle {
    font-size:13px; color:var(--muted); margin-top:4px; line-height:1.4;
  }

  /* ── Form elements ── */
  .field { display:flex; flex-direction:column; gap:6px; }
  .field-label {
    font-family:var(--font-hud); font-size:10px; font-weight:700;
    letter-spacing:0.2em; color:var(--muted); text-transform:uppercase;
  }
  .input-wrap { position:relative; }
  .input-icon {
    position:absolute; left:13px; top:50%; transform:translateY(-50%);
    color:var(--muted); pointer-events:none; transition:color .2s;
    display:flex; align-items:center;
  }
  .input-eye {
    position:absolute; right:13px; top:50%; transform:translateY(-50%);
    color:var(--muted); cursor:pointer; transition:color .2s;
    background:none; border:none; padding:0; display:flex; align-items:center;
  }
  .input-eye:hover { color:var(--text); }
  .field-input {
    width:100%;
    padding: 12px 16px 12px 40px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius:8px;
    color:var(--text);
    font-family:var(--font-body);
    font-size:14px;
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline:none;
  }
  .field-input::placeholder { color:rgba(255,255,255,0.2); }
  .field-input:focus {
    border-color: var(--neon);
    background: rgba(0,255,135,0.04);
    box-shadow: 0 0 0 3px rgba(0,255,135,0.08), inset 0 0 0 1px rgba(0,255,135,0.1);
  }
  .field-input:focus + .input-icon-after,
  .input-wrap:focus-within .input-icon { color:var(--neon); }

  /* ── Strength bar ── */
  .strength-bars { display:flex; gap:4px; margin-top:6px; }
  .strength-bar {
    flex:1; height:2px; border-radius:2px;
    background:rgba(255,255,255,0.08);
    transition: background .3s;
  }
  .strength-bar.s1 { background:var(--danger); }
  .strength-bar.s2 { background:#FFB020; }
  .strength-bar.s3 { background:var(--neon); }
  .strength-checklist { display:flex; flex-direction:column; gap:3px; margin-top:6px; }
  .strength-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted); }
  .strength-item.ok { color:var(--neon); }
  .strength-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

  /* ── Botón principal ── */
  .btn-primary {
    width:100%; padding:13px 16px;
    background: linear-gradient(135deg, #00E676 0%, #00C853 100%);
    border:none; border-radius:8px; cursor:pointer;
    font-family:var(--font-hud); font-size:15px; font-weight:800;
    letter-spacing:0.1em; text-transform:uppercase; color:#050E08;
    position:relative; overflow:hidden;
    transition: transform .15s, box-shadow .2s, filter .2s;
    box-shadow: 0 0 20px rgba(0,230,118,0.25), 0 4px 12px rgba(0,0,0,0.4);
  }
  .btn-primary::before {
    content:'';
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
    transform:translateX(-100%);
    transition: transform .4s ease;
  }
  .btn-primary:hover:not(:disabled)::before { transform:translateX(100%); }
  .btn-primary:hover:not(:disabled) {
    transform:translateY(-1px);
    box-shadow: 0 0 30px rgba(0,255,135,0.4), 0 8px 20px rgba(0,0,0,0.4);
    filter:brightness(1.05);
  }
  .btn-primary:active:not(:disabled) { transform:translateY(0); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

  /* ── Botón Google ── */
  .btn-google {
    width:100%; padding:12px 16px;
    background: rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; cursor:pointer;
    font-family:var(--font-body); font-size:14px; font-weight:500;
    color:var(--text);
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition: background .2s, border-color .2s, transform .15s, box-shadow .2s;
    position:relative; overflow:hidden;
  }
  .btn-google:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color:rgba(255,255,255,0.2);
    transform:translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .btn-google:disabled { opacity:0.5; cursor:not-allowed; }

  /* ── Divisor ── */
  .divider {
    display:flex; align-items:center; gap:10px;
    font-family:var(--font-hud); font-size:10px; font-weight:700;
    letter-spacing:0.2em; color:rgba(255,255,255,0.2);
    text-transform:uppercase;
  }
  .divider::before, .divider::after {
    content:''; flex:1; height:1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }

  /* ── Link forgot / switch ── */
  .link-forgot {
    font-size:12px; color:var(--neon); text-decoration:none;
    opacity:0.7; transition:opacity .2s;
  }
  .link-forgot:hover { opacity:1; }
  .switch-text {
    text-align:center; font-size:13px; color:var(--muted);
  }
  .switch-link {
    color:var(--neon); font-weight:600; text-decoration:none;
    transition:opacity .2s;
  }
  .switch-link:hover { opacity:0.8; }

  /* ── Error ── */
  .error-box {
    display:flex; align-items:flex-start; gap:10px;
    padding:10px 14px; border-radius:8px;
    background:rgba(255,69,96,0.08); border:1px solid rgba(255,69,96,0.2);
    color:#FF8099; font-size:13px; line-height:1.4;
    animation: fade-in .3s ease;
  }
  .error-icon { flex-shrink:0; margin-top:1px; }

  /* ── Success ── */
  .success-box {
    text-align:center; padding:12px 0;
    animation: fade-in .4s ease;
  }
  .success-icon-wrap {
    width:64px; height:64px; border-radius:50%; margin:0 auto 16px;
    background:rgba(0,255,135,0.08);
    border:1px solid rgba(0,255,135,0.25);
    display:flex; align-items:center; justify-content:center;
  }
  .success-title {
    font-family:var(--font-hud); font-size:22px; font-weight:800;
    text-transform:uppercase; color:var(--text); letter-spacing:0.05em;
    margin-bottom:6px;
  }
  .success-body { font-size:13px; color:var(--muted); line-height:1.5; }
  .success-link {
    display:inline-block; margin-top:16px; font-size:13px;
    color:var(--neon); text-decoration:none;
    font-family:var(--font-hud); letter-spacing:0.1em; font-weight:700;
  }

  /* ── Spinner ── */
  .spinner {
    width:16px; height:16px; border-radius:50%;
    border:2px solid rgba(5,13,7,0.3);
    border-top-color:#050D07;
    animation:spin .7s linear infinite; display:inline-block;
  }
  .spinner-white {
    border:2px solid rgba(255,255,255,0.15);
    border-top-color:rgba(255,255,255,0.7);
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── Footer ── */
  .auth-footer {
    font-size:11px; color:rgba(255,255,255,0.2);
    text-align:center; line-height:1.5;
  }
  .auth-footer a {
    color:rgba(255,255,255,0.35); text-decoration:underline;
    text-underline-offset:2px; transition:color .2s;
  }
  .auth-footer a:hover { color:rgba(255,255,255,0.6); }

  /* ── Form spacing ── */
  .form-fields { display:flex; flex-direction:column; gap:14px; }
  .form-actions { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
  .row-between { display:flex; align-items:center; justify-content:space-between; }

  /* ── Global utils ── */
  @keyframes fade-in {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  * { box-sizing:border-box; }
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color:#E8F0E9 !important;
    -webkit-box-shadow:0 0 0 1000px #0E1410 inset !important;
    caret-color:#E8F0E9;
  }
`;
