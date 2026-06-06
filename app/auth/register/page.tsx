import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout }    from "@/components/auth/AuthLayout";
import { RegisterForm }  from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta | Quiniela",
  description: "Regístrate gratis y empieza a competir con tus amigos.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete y compite en las quinielas de la temporada"
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
