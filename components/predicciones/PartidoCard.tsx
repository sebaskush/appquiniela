"use client";

import { useCountdown } from "@/lib/hooks/useCountdown";

type Props = {
  partido: {
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
  localVal: string;
  visitanteVal: string;
  onChange: (id: string, campo: "local" | "visitante", valor: string) => void;
};

const EMOJI_FLAGS: Record<string, string> = {
  "México": "🇲🇽", "Mexico": "🇲🇽",
  "USA": "🇺🇸", "Estados Unidos": "🇺🇸",
  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Brazil": "🇧🇷",
  "España": "🇪🇸", "Spain": "🇪🇸",
  "Francia": "🇫🇷", "France": "🇫🇷",
  "Alemania": "🇩🇪", "Germany": "🇩🇪",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Portugal": "🇵🇹", "Italia": "🇮🇹", "Italy": "🇮🇹",
  "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Chile": "🇨🇱",
  "Japón": "🇯🇵", "Japan": "🇯🇵",
  "Marruecos": "🇲🇦", "Morocco": "🇲🇦",
  "Canadá": "🇨🇦", "Canada": "🇨🇦",
};

function EscudoEquipo({ nombre, logoUrl, lado }: { nombre: string; logoUrl: string | null; lado: "local" | "visitante" }) {
  const flag = EMOJI_FLAGS[nombre];
  return (
    <div className={`team-block team-block--${lado}`}>
      <div className="team-escudo">
        {logoUrl ? (
          <img src={logoUrl} alt={nombre} width={40} height={40} style={{ objectFit: "contain" }} />
        ) : flag ? (
          <span style={{ fontSize: 28, lineHeight: 1 }}>{flag}</span>
        ) : (
          <div className="team-initial">{nombre.charAt(0)}</div>
        )}
      </div>
      <span className="team-name">{nombre}</span>
    </div>
  );
}

function Countdown({ fechaHora }: { fechaHora: string }) {
  const { texto, bloqueado, minutos, horas, dias } = useCountdown(fechaHora);
  const urgente = !bloqueado && dias === 0 && horas === 0 && minutos < 30;
  return (
    <div className={`countdown ${bloqueado ? "countdown--locked" : urgente ? "countdown--urgent" : ""}`}>
      <span className="countdown-dot" />
      <span className="countdown-text">{texto}</span>
    </div>
  );
}

export function PartidoCard({ partido, localVal, visitanteVal, onChange }: Props) {
  const { bloqueado } = useCountdown(partido.fecha_hora);
  const esBloqueado = partido.bloqueado || bloqueado;

  const fecha = new Date(partido.fecha_hora);
  const fechaStr = fecha.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  const horaStr  = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  function handleInput(campo: "local" | "visitante", valor: string) {
    if (esBloqueado) return;
    const limpio = valor.replace(/[^0-9]/g, "").slice(0, 2);
    onChange(partido.id, campo, limpio);
  }

  const tienePred = partido.prediccion !== null;
  const yaIngresado = localVal !== "" && visitanteVal !== "";

  return (
    <div className={`partido-card ${esBloqueado ? "partido-card--locked" : ""} ${yaIngresado && !esBloqueado ? "partido-card--filled" : ""}`}>

      {/* Barra superior tricolor */}
      <div className="partido-bar" />

      {/* Header: fecha + countdown */}
      <div className="partido-header">
        <div className="partido-fecha">
          <span className="partido-fecha-dia">{fechaStr}</span>
          <span className="partido-fecha-hora">{horaStr} hrs</span>
        </div>
        <Countdown fechaHora={partido.fecha_hora} />
      </div>

      {/* Cuerpo principal */}
      <div className="partido-body">
        <EscudoEquipo nombre={partido.equipo_local} logoUrl={partido.logo_local_url} lado="local" />

        {/* Marcador / inputs */}
        <div className="partido-score">
          {esBloqueado ? (
            /* Estado bloqueado */
            <div className="score-locked">
              {partido.goles_local_real !== null ? (
                /* Resultado real */
                <>
                  <span className="score-real">{partido.goles_local_real}</span>
                  <span className="score-sep">-</span>
                  <span className="score-real">{partido.goles_visitante_real}</span>
                </>
              ) : tienePred ? (
                /* Predicción guardada */
                <>
                  <span className="score-pred">{partido.prediccion!.goles_local}</span>
                  <span className="score-sep score-sep--pred">-</span>
                  <span className="score-pred">{partido.prediccion!.goles_visitante}</span>
                </>
              ) : (
                /* Sin predicción y bloqueado */
                <div className="score-no-pred">
                  <LockIcon />
                  <span>Sin pronóstico</span>
                </div>
              )}
              <div className="lock-badge"><LockIcon /></div>
            </div>
          ) : (
            /* Inputs activos */
            <div className="score-inputs">
              <input
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={localVal}
                onChange={(e) => handleInput("local", e.target.value)}
                placeholder="0"
                className="score-input"
                aria-label={`Goles ${partido.equipo_local}`}
              />
              <span className="score-vsep">-</span>
              <input
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={visitanteVal}
                onChange={(e) => handleInput("visitante", e.target.value)}
                placeholder="0"
                className="score-input"
                aria-label={`Goles ${partido.equipo_visitante}`}
              />
            </div>
          )}
        </div>

        <EscudoEquipo nombre={partido.equipo_visitante} logoUrl={partido.logo_visitante_url} lado="visitante" />
      </div>

      {/* Footer: estado */}
      <div className="partido-footer">
        {esBloqueado ? (
          <span className="estado estado--locked">
            <LockIcon size={11} /> Bloqueado
          </span>
        ) : tienePred ? (
          <span className="estado estado--saved">
            <CheckIcon /> Pronóstico guardado
          </span>
        ) : (
          <span className="estado estado--open">
            <PencilIcon /> Ingresa tu pronóstico
          </span>
        )}
      </div>
    </div>
  );
}

function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  );
}
