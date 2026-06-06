import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm }  from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Quiniela",
  description: "Accede a tu cuenta y compite con tus amigos.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Ingresa para ver tus quinielas y clasificaciones"
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
