"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

const passwordRules = [
  { label: "Al menos 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un número",              test: (p: string) => /\d/.test(p) },
];

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [isPending, startTransition]    = useTransition();

  const passwordStrength = passwordRules.filter((r) => r.test(password)).length;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const pass    = formData.get("password") as string;
    const confirm = formData.get("confirm")  as string;

    if (pass !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (pass.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-brand-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">¡Cuenta creada!</h3>
          <p className="text-white/50 text-sm mt-1">
            Revisa tu correo y confirma tu cuenta para comenzar a jugar.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-block mt-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          Ir al inicio de sesión →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-xs font-medium text-white/50 uppercase tracking-widest">
          Nombre
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre"
            className="
              w-full pl-10 pr-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25 text-sm
              focus:outline-none focus:border-brand-500/60 focus:bg-white/8
              transition-all duration-200
            "
          />
        </div>
      </div>

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
              text-white placeholder:text-white/25 text-sm
              focus:outline-none focus:border-brand-500/60 focus:bg-white/8
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-white/50 uppercase tracking-widest">
          Contraseña
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full pl-10 pr-12 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25 text-sm
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

        {/* Indicador de fortaleza */}
        {password.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < passwordStrength
                      ? passwordStrength === 1 ? "bg-red-400"
                        : passwordStrength === 2 ? "bg-yellow-400"
                        : "bg-brand-400"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <ul className="space-y-1">
              {passwordRules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2 text-xs">
                  <Check
                    size={11}
                    className={`transition-colors ${rule.test(password) ? "text-brand-400" : "text-white/20"}`}
                  />
                  <span className={`transition-colors ${rule.test(password) ? "text-white/60" : "text-white/30"}`}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-xs font-medium text-white/50 uppercase tracking-widest">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="
              w-full pl-10 pr-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25 text-sm
              focus:outline-none focus:border-brand-500/60 focus:bg-white/8
              transition-all duration-200
            "
          />
        </div>
      </div>

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
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">o</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <GoogleButton label="Registrarse con Google" />

      <p className="text-center text-sm text-white/40 pt-1">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
