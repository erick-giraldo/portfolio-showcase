# Landing page de CV profesional (bilingüe, animada)

Una sola página moderna estilo producto tech/exchange, en la ruta `/`, pensada para reclutadores: escaneable en 30 segundos, con animaciones sobrias y contenido bilingüe ES/EN.

## Dirección visual

- Paleta Midnight Indigo: fondo `#0a0a1a`, superficies `#141432`, bordes/acentos profundos `#1e1e5a`, acento vivo `#4f46e5`.
- Tipografía: Space Grotesk para títulos, DM Sans para texto (estética tech, tipo Linear/Stripe).
- Superficies tipo "glass" con bordes sutiles, grid de fondo animado, glow suave del acento indigo.
- Radios medios, mucho espacio en blanco, jerarquía tipográfica fuerte.

## Secciones

1. **Nav fija** — nombre/monograma, enlaces ancla, toggle ES/EN, botón "Descargar CV".
2. **Hero** — nombre, rol, propuesta de valor en una línea, CTAs (Contacto / GitHub), fondo animado con grid + gradiente en movimiento.
3. **Stack tecnológico** — marquee/cinta continua con logos y nombres (Google Cloud, Docker, Kubernetes, React, Node, Python, etc.), agrupado por categoría.
4. **Proyectos de GitHub** — grid de tarjetas con nombre, descripción, lenguaje, estrellas y link. Datos reales traídos de la API pública de GitHub por username, con caché por 1 hora y fallback a proyectos destacados definidos manualmente.
5. **Experiencia** — timeline vertical con reveal al hacer scroll (empresa, rol, fechas, 2-3 logros).
6. **Certificaciones / Cloud** — tarjetas para certificaciones (Google Cloud, etc.) con emisor y año.
7. **Sobre mí + métricas** — bio corta y contadores animados (años de experiencia, proyectos, repos).
8. **Contacto / Footer** — email, LinkedIn, GitHub, ubicación, disponibilidad.

## Animación

- Motion for React: reveals al entrar en viewport (fade + subida), stagger en grids, hover elevado en tarjetas, contadores animados, marquee infinito CSS, gradiente del hero en loop suave.
- Todo respeta `prefers-reduced-motion`.

## Bilingüe

- Diccionario ES/EN en un módulo de contenido, contexto React ligero + toggle en el nav. Preferencia guardada en `localStorage`. Español por defecto.

## Detalles técnicos

- Ruta única `src/routes/index.tsx` (reemplaza el placeholder), secciones como componentes en `src/components/landing/`.
- Tokens de color/tipografía en `src/styles.css` (`@theme`, oklch); fuentes vía `<link>` en `__root.tsx`.
- GitHub: server function `src/lib/github.functions.ts` que llama a `api.github.com/users/{user}/repos`, ordena por estrellas, filtra forks; consumida con TanStack Query. Sin backend ni base de datos.
- SEO: `head()` propio en la ruta index con título, descripción, og y twitter; H1 único; JSON-LD `Person`.

## Necesito de tu parte

Para llenar el contenido real (mientras tanto uso contenido de ejemplo claramente marcado):

- Tu usuario de GitHub y los repos que quieres destacar.
- Nombre, rol/título, bio corta, ubicación, email, LinkedIn.
- Experiencia laboral (empresa, rol, fechas, logros) y certificaciones.
- Si tienes el CV en PDF, súbelo y extraigo todo de ahí.
