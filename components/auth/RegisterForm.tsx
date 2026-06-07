"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthLayout } from "@/components/auth/AuthLayout";

const rules = [
  { label: "8 caracteres mínimo", test: (p: string) => p.length >= 8 },
  { label: "Una mayúscula",        test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un número",            test: (p: string) => /\d/.test(p) },
];

export function RegisterForm() {
  const [showPass, setShowPass]       = useState(false);
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [isPending, startTransition]  = useTransition();

  const strength = rules.filter((r) => r.test(password)).length;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd      = new FormData(e.currentTarget);
    const pass    = fd.get("password") as string;
    const confirm = fd.get("confirm")  as string;

    if (pass !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (pass.length < 8)  { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    startTransition(async () => {
      const res = await registerAction(fd);
      if (res?.error)   setError(res.error);
      else if (res?.success) setSuccess(true);
    });
  }

  if (success) {
    return (
      <AuthLayout mode="register">
        <div className="success-box">
          <div className="success-icon-wrap">
            <CheckBigIcon />
          </div>
          <div className="success-title">¡CUENTA CREADA!</div>
          <p className="success-body">
            Revisa tu correo electrónico y confirma tu cuenta para empezar a jugar.
          </p>
          <Link href="/auth/login" className="success-link">
            IR AL LOGIN →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="register">
      <div className="card-header">
        <div className="card-eyebrow">Nuevo jugador</div>
        <h1 className="card-title">CREA TU<br /><span>CUENTA</span></h1>
        <p className="card-subtitle">Únete y compite en las quinielas de la temporada</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-box" style={{ marginBottom: 14 }}>
            <span className="error-icon"><AlertIcon /></span>
            {error}
          </div>
        )}

        <div className="form-fields">
          {/* Nombre */}
          <div className="field">
            <label htmlFor="reg-nombre" className="field-label">Nombre</label>
            <div className="input-wrap">
              <span className="input-icon"><UserIcon /></span>
              <input
                id="reg-nombre" name="nombre" type="text"
                autoComplete="name" required placeholder="Tu nombre"
                className="field-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="reg-email" className="field-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon"><MailIcon /></span>
              <input
                id="reg-email" name="email" type="email"
                autoComplete="email" required placeholder="tu@email.com"
                className="field-input"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="field">
            <label htmlFor="reg-password" className="field-label">Contraseña</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="reg-password" name="password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password" required placeholder="••••••••"
                className="field-input" style={{ paddingRight: 44 }}
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button" className="input-eye"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Ocultar" : "Mostrar"}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Fortaleza */}
            {password.length > 0 && (
              <>
                <div className="strength-bars">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`strength-bar ${i < strength ? `s${strength}` : ""}`}
                    />
                  ))}
                </div>
                <div className="strength-checklist">
                  {rules.map((r) => (
                    <div key={r.label} className={`strength-item ${r.test(password) ? "ok" : ""}`}>
                      <div className="strength-dot" />
                      {r.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Confirmar */}
          <div className="field">
            <label htmlFor="reg-confirm" className="field-label">Confirmar contraseña</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="reg-confirm" name="confirm"
                type={showPass ? "text" : "password"}
                autoComplete="new-password" required placeholder="••••••••"
                className="field-input"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending
              ? <><span className="spinner" style={{ marginRight: 8 }} />Creando cuenta…</>
              : "UNIRME AL EQUIPO"
            }
          </button>

          <div className="divider">o regístrate con</div>

          <GoogleButton label="Registrarse con Google" />

          <p className="switch-text">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="switch-link">
              Inicia sesión →
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

/* ── Micro-iconos ─────────────────────────────────────────────── */
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
function CheckBigIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
