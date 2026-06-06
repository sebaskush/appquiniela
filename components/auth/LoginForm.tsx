"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function LoginForm() {
  const searchParams  = useSearchParams();
  const redirectError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<string | null>(
    redirectError === "auth_callback_error"
      ? "Hubo un problema con el inicio de sesión. Intenta de nuevo."
      : null
  );
  const [isPending, startTransition]    = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Error global */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-white/50 uppercase tracking-widest">
          Email
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            className="
              w-full pl-10 pr-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25
              text-sm
              focus:outline-none focus:border-brand-500/60 focus:bg-white/8
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium text-white/50 uppercase tracking-widest">
            Contraseña
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="
              w-full pl-10 pr-12 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25
              text-sm
              focus:outline-none focus:border-brand-500/60 focus:bg-white/8
              transition-all duration-200
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="
          w-full py-3 rounded-xl
          bg-brand-500 hover:bg-brand-400
          text-sm font-semibold text-white
          transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-brand-500/50
          shadow-lg shadow-brand-500/20
        "
      >
        {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">o</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google */}
      <GoogleButton label="Iniciar sesión con Google" />

      {/* Registro */}
      <p className="text-center text-sm text-white/40 pt-1">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
