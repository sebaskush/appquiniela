import type { ReactNode } from "react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-pitch-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Fondo: cancha estilizada */}
      <div className="absolute inset-0 bg-pitch-texture" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 59px,
              rgba(255,255,255,1) 59px,
              rgba(255,255,255,1) 60px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 59px,
              rgba(255,255,255,1) 59px,
              rgba(255,255,255,1) 60px
            )
          `,
        }}
      />

      {/* Glow verde central */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />

      {/* Tarjeta */}
      <div className="relative w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5"/>
                <path d="M10 2C10 2 7 6 7 10C7 14 10 18 10 18" stroke="white" strokeWidth="1.5"/>
                <path d="M10 2C10 2 13 6 13 10C13 14 10 18 10 18" stroke="white" strokeWidth="1.5"/>
                <path d="M2 10H18" stroke="white" strokeWidth="1.5"/>
                <path d="M2.5 7H17.5M2.5 13H17.5" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
              </svg>
            </div>
            <span
              className="text-white font-display text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
            >
              Quiniela
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-white/40 mt-1">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="
          rounded-2xl border border-white/8
          bg-white/[0.04] backdrop-blur-sm
          p-6 sm:p-8
          shadow-2xl shadow-black/40
        ">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          Al continuar aceptas nuestros{" "}
          <a href="/terminos" className="underline underline-offset-2 hover:text-white/40 transition-colors">
            Términos de servicio
          </a>{" "}
          y{" "}
          <a href="/privacidad" className="underline underline-offset-2 hover:text-white/40 transition-colors">
            Política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
