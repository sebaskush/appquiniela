# Quiniela App — Next.js + Supabase Auth

## Stack
- **Next.js 14** (App Router + Server Actions)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS**
- **TypeScript**

---

## 1. Instalar dependencias

```bash
npm install
```

---

## 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Encuéntralos en: **Supabase Dashboard → Settings → API**

---

## 3. Configurar Google OAuth en Supabase

1. Ve a **Supabase Dashboard → Authentication → Providers**
2. Habilita **Google**
3. En [Google Cloud Console](https://console.cloud.google.com/):
   - Crea un proyecto (o usa uno existente)
   - Ve a **APIs & Services → Credentials → Create OAuth client**
   - Tipo: **Web application**
   - **Authorized redirect URIs**: `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y **Client Secret** en Supabase

---

## 4. Configurar URL de redirección en Supabase

En **Supabase → Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (en producción: tu dominio)
- **Redirect URLs**: agrega `http://localhost:3000/auth/callback`

---

## 5. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Flujo de autenticación

```
/ → detecta sesión → /dashboard (auth) o /auth/login (sin auth)

/auth/login     → email+pass → Server Action → /dashboard
                → Google     → OAuth → /auth/callback → /dashboard

/auth/register  → email+pass → Server Action → email de confirmación
                → Google     → OAuth → /auth/callback → /dashboard

/auth/callback  → intercambia código por sesión → sincroniza tabla usuarios → /dashboard
```

---

## Estructura del proyecto

```
quiniela-app/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts     ← OAuth callback handler
│   │   ├── login/page.tsx        ← Página de login
│   │   └── register/page.tsx     ← Página de registro
│   ├── dashboard/page.tsx        ← Dashboard protegido
│   ├── layout.tsx
│   ├── page.tsx                  ← Redirige según sesión
│   └── globals.css
├── components/auth/
│   ├── AuthLayout.tsx            ← Layout visual de auth
│   ├── LoginForm.tsx             ← Formulario de login
│   ├── RegisterForm.tsx          ← Formulario de registro
│   └── GoogleButton.tsx          ← Botón OAuth Google
├── lib/
│   ├── actions/auth.ts           ← Server Actions
│   └── supabase/
│       ├── client.ts             ← Cliente browser
│       └── server.ts             ← Cliente servidor
└── middleware.ts                 ← Protección de rutas
```
