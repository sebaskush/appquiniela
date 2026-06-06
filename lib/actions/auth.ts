"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Registro con email + contraseña ───────────────────────
export async function registerAction(formData: FormData) {
  const supabase = await createClient();

  const nombre  = formData.get("nombre")  as string;
  const email   = formData.get("email")   as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Insertar en tabla pública usuarios (complementa auth.users)
  if (data.user) {
    await supabase.from("usuarios").upsert({
      id:     data.user.id,
      nombre,
      email,
    });
  }

  return { success: true, needsConfirmation: !data.session };
}

// ─── Login con email + contraseña ──────────────────────────
export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Login / Registro con Google OAuth ─────────────────────
export async function googleOAuthAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: "No se pudo conectar con Google. Intenta de nuevo." };
  }

  if (data.url) {
    redirect(data.url);
  }
}

// ─── Logout ────────────────────────────────────────────────
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// ─── Traducción de errores de Supabase Auth ────────────────
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials":
      "Email o contraseña incorrectos.",
    "Email not confirmed":
      "Confirma tu email antes de iniciar sesión.",
    "User already registered":
      "Este email ya está registrado. Inicia sesión.",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 6 caracteres.",
    "Unable to validate email address: invalid format":
      "El formato del email no es válido.",
    "Email rate limit exceeded":
      "Demasiados intentos. Espera unos minutos.",
    "signup_disabled":
      "El registro está desactivado temporalmente.",
  };

  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value;
  }

  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
