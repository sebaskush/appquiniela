-- ============================================================
--  HACER ADMIN A TU USUARIO
--  Ejecuta esto en Supabase SQL Editor con tu email real
-- ============================================================

-- Reemplaza 'tu@email.com' con el email con el que te registraste
UPDATE usuarios
SET rol = 'admin'
WHERE email = 'tu@email.com';

-- Verificar que quedó como admin
SELECT id, nombre, email, rol
FROM usuarios
WHERE email = 'tu@email.com';
