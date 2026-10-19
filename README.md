# portfolio-showcase

Portafolio de Erick Giraldo Muñoz — Next.js (App Router), React 19, Tailwind CSS 4, Supabase.

## Desarrollo

```sh
cp .env.example .env.local   # completa las variables de Supabase
yarn install
yarn dev                     # http://localhost:3000
```

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Landing |
| `/auth` | Login del panel (email/contraseña; Google/Apple requieren el proveedor activo en Supabase) |
| `/admin` | Panel de contenido: textos, proyectos, archivos y música |
| `/api/public/file/[name]` | Lee archivos del bucket `site-files` (con soporte de rangos para audio) |
| `/api/github-repos?username=` | Repos públicos destacados, cacheados 1 h |

## Despliegue en Vercel

1. Importa el repo en Vercel y elige la rama `nextjs`.
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Environment Variables.
3. Deploy. En Supabase → Authentication → URL Configuration, agrega el dominio de Vercel a las Redirect URLs.
