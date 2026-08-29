# Landing page CV — Erick Giraldo Muñoz (bilingüe ES/EN, animada)

Página única en `/` con el contenido real de tu CV, orientada a reclutadores tech/FinTech.

## Dirección visual

- Midnight Indigo: fondo `#0a0a1a`, superficies `#141432`, bordes `#1e1e5a`, acento `#4f46e5`.
- Space Grotesk (títulos) + DM Sans (texto), cargadas con `<link>` en `__root.tsx`.
- Superficies glass, grid animado de fondo, glow indigo, tipografía de alto contraste — estética tipo exchange/Linear.

## Secciones y contenido (extraído del CV)

1. **Nav fija** — "EG", anclas a secciones, toggle ES/EN, botón "Descargar CV" (PDF servido como asset).
2. **Hero** — Erick Giraldo Muñoz · Full Stack Developer & IT Infrastructure · 12+ años en FinTech. CTAs: Contacto y LinkedIn. Chips: React · Next.js · TypeScript · NestJS · GCP. Fondo animado.
3. **Métricas animadas** — 12+ años de experiencia, 1,000+ usuarios activos soportados, 6+ años en rol dual dev/IT, 50% reducción de backlog de tickets.
4. **Stack** — marquee por categorías: Frontend, Next.js Architecture, TypeScript, Backend & DB, API & Resilience, Auth & Security, Cloud & DevOps, Real-Time & Payments, Mobile, Observability, Infra & Identity.
5. **Proyectos** — tarjetas con los 3 del CV: Crypto Portfolio Tracker (NestJS/Next.js/Flutter, BFF dual, WebSocket Coinbase, JWT, Firebase, PostgreSQL); Areia Bela (Next.js + NestJS monorepo Turborepo/pnpm, Cloud Run, Stripe + webhooks); Banexcoin Bcore (CMS y front del exchange, trading, KYC, pagos QR stablecoin). Cada tarjeta con tags de tecnología y link cuando aplique.
6. **Repos de GitHub** — grid dinámico con la API pública de GitHub (nombre, descripción, lenguaje, estrellas, link), ordenado por estrellas y sin forks. Necesito tu usuario de GitHub; hasta entonces la sección queda oculta si no hay usuario configurado.
7. **Experiencia** — timeline con reveal al scroll: Banexcoin SA (Nov 2019 – Presente) y Corsurp SAC (May 2013 – Sep 2019), con los logros clave de cada uno.
8. **Certificaciones y educación** — CompTIA A+ (en curso), Desarrollo Seguro con Flutter, AI Fluency (Anthropic), Claude 101 (Anthropic); Coderhouse Full Stack, ISIL Network & Communications Engineering.
9. **Contacto / Footer** — egiraldom@outlook.com, +1 860 549 7679, Holbrook NY, linkedin.com/in/egiraldo, idiomas (Español nativo / Inglés básico).

## Animación

Motion for React: reveals al entrar en viewport, stagger en grids, hover elevado en tarjetas, contadores animados, marquee infinito, gradiente del hero en loop. Respeta `prefers-reduced-motion`.

## Bilingüe

Diccionario ES/EN en un módulo de contenido + contexto React ligero y toggle en el nav; preferencia en `localStorage`, español por defecto.

## Detalles técnicos

- `src/routes/index.tsx` reemplaza el placeholder; secciones en `src/components/landing/`.
- Tokens en `src/styles.css` (`@theme inline`, oklch).
- CV en PDF publicado como asset vía `lovable-assets` para el botón de descarga.
- GitHub: server function `src/lib/github.functions.ts` (API pública, sin token) consumida con TanStack Query.
- SEO: `head()` propio con título/description/og/twitter, H1 único, JSON-LD `Person`.

## Pendiente

Tu usuario de GitHub para activar la sección de repos (puedes dármelo ahora o después).
