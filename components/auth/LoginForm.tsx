"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthLayout } from "@/components/auth/AuthLayout";

export function LoginForm() {
  const searchParams  = useSearchParams();
  const redirectError = searchParams.get("error");

  const [showPass, setShowPass]          = useState(false);
  const [error, setError]                = useState<string | null>(
    redirectError === "auth_callback_error"
      ? "Hubo un problema al iniciar sesión. Intenta de nuevo."
      : null
  );
  const [isPending, startTransition]     = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <AuthLayout mode="login">
      <div className="card-header">
        <div className="card-eyebrow">Acceso al sistema</div>
        <h1 className="card-title">INICIA<br /><span>SESIÓN</span></h1>
        <p className="card-subtitle">Ingresa para ver tus quinielas y clasificaciones</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-box" style={{ marginBottom: 14 }}>
            <span className="error-icon">
              <AlertIcon />
            </span>
            {error}
          </div>
        )}

        <div className="form-fields">
          {/* Email */}
          <div className="field">
            <label htmlFor="login-email" className="field-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon"><MailIcon /></span>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                className="field-input"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="field">
            <div className="row-between">
              <label htmlFor="login-password" className="field-label">Contraseña</label>
              <Link href="/auth/forgot-password" className="link-forgot">
                ¿La olvidaste?
              </Link>
            </div>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="login-password"
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="field-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending
              ? <><span className="spinner" style={{ marginRight: 8 }} />Verificando…</>
              : "ENTRAR AL CAMPO"
            }
          </button>

          <div className="divider">o continúa con</div>

          <GoogleButton label="Iniciar sesión con Google" />

          <p className="switch-text">
            ¿Sin cuenta?{" "}
            <Link href="/auth/register" className="switch-link">
              Regístrate gratis →
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

/* ── Micro-iconos ─────────────────────────────────────────────── */
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
