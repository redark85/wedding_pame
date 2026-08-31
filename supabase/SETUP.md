# Configuración de Supabase para Wedding_Pame

## 1. Crear las tablas y políticas de seguridad

1. Abre el dashboard de Supabase del proyecto **Wedding_Pame**.
2. Ve a **SQL Editor** → **New query**.
3. Copia y pega el contenido de [`schema.sql`](./schema.sql).
4. Pulsa **Run**.

Esto crea la tabla `rsvp` y las políticas RLS necesarias:
- Cualquier visitante puede enviar una confirmación (`INSERT`).
- Solo usuarios autenticados pueden ver/editar las confirmaciones (`SELECT`, `UPDATE`, `DELETE`).

## 2. Crear el usuario administrador

1. En el dashboard de Supabase ve a **Authentication** → **Users**.
2. Pulsa **Add user** (o **Invite user**).
3. Introduce un email, por ejemplo `admin@weddingpame.com`, y una contraseña segura.
4. Si quieres evitar tener que confirmar el email, ve a **Authentication** → **Providers** → **Email** y desactiva la opción **Confirm email**.
5. Guarda el email y la contraseña que usarás para entrar en `admin.html`.

> **Importante:** No compartas la contraseña del admin ni la *Service Role Key* de Supabase. La *Publishable/Anon Key* que está en `supabase-config.js` es segura para el navegador.

## 3. Probar la integración

1. Abre `index.html` en un servidor local o despliega la página.
2. Rellena el formulario de confirmación (RSVP) y envíalo.
3. Abre `admin.html`, inicia sesión con el email y contraseña del admin.
4. Deberías ver la nueva confirmación en la tabla.

## 4. Notas sobre seguridad

- La tabla `rsvp` tiene habilitado **Row Level Security (RLS)**.
- No expongas nunca la `SERVICE_ROLE_KEY` en el frontend.
- La `SUPABASE_ANON_KEY` es pública por diseño y solo permite las operaciones permitidas por las políticas RLS.
