export type Lang = "es" | "en";

// Configura aquí tu usuario de GitHub para activar la sección de repos.
export const GITHUB_USERNAME = "";

export const profile = {
  name: "Erick Giraldo Muñoz",
  initials: "EG",
  location: "Holbrook, NY",
  phone: "+1 860 549 7679",
  email: "egiraldom@outlook.com",
  linkedin: "https://linkedin.com/in/egiraldo",
};

type Dict = {
  nav: { about: string; stack: string; projects: string; repos: string; experience: string; contact: string };
  cta: { downloadCv: string; contact: string; linkedin: string; viewProject: string };
  hero: {
    badge: string;
    role: string;
    tagline: string;
    scroll: string;
  };
  metrics: { value: string; label: string }[];
  sections: Record<
    "stack" | "projects" | "repos" | "experience" | "credentials" | "contact",
    { eyebrow: string; title: string; subtitle: string }
  >;
  stack: { category: string; items: string[] }[];
  projects: { name: string; year: string; description: string; tags: string[]; href?: string }[];
  experience: { company: string; role: string; period: string; location: string; bullets: string[] }[];
  certifications: { name: string; issuer: string }[];
  education: { title: string; school: string; period: string }[];
  languages: string;
  reposEmpty: string;
  footerNote: string;
};

export const content: Record<Lang, Dict> = {
  es: {
    nav: {
      about: "Perfil",
      stack: "Stack",
      projects: "Proyectos",
      repos: "GitHub",
      experience: "Experiencia",
      contact: "Contacto",
    },
    cta: {
      downloadCv: "Descargar CV",
      contact: "Contactar",
      linkedin: "LinkedIn",
      viewProject: "Ver proyecto",
    },
    hero: {
      badge: "Disponible para nuevas oportunidades",
      role: "Full Stack Developer & IT Infrastructure",
      tagline:
        "12+ años construyendo y sosteniendo plataformas FinTech: React, Next.js, TypeScript, NestJS y Google Cloud, con foco en resiliencia de APIs, seguridad e identidad.",
      scroll: "Desplázate",
    },
    metrics: [
      { value: "12+", label: "Años de experiencia" },
      { value: "1000+", label: "Usuarios activos soportados" },
      { value: "6+", label: "Años en rol dual Dev/IT" },
      { value: "50%", label: "Reducción de backlog de tickets" },
    ],
    sections: {
      stack: {
        eyebrow: "Capacidades",
        title: "Stack tecnológico",
        subtitle: "Herramientas y prácticas que uso a diario en entornos críticos de FinTech.",
      },
      projects: {
        eyebrow: "Trabajo",
        title: "Proyectos destacados",
        subtitle: "Productos end-to-end: arquitectura, backend, frontend y despliegue en la nube.",
      },
      repos: {
        eyebrow: "Código",
        title: "Repositorios en GitHub",
        subtitle: "Repositorios públicos, ordenados por relevancia.",
      },
      experience: {
        eyebrow: "Trayectoria",
        title: "Experiencia profesional",
        subtitle: "Desarrollo de producto e infraestructura, en paralelo.",
      },
      credentials: {
        eyebrow: "Formación",
        title: "Certificaciones y educación",
        subtitle: "Aprendizaje continuo en desarrollo, seguridad e IA.",
      },
      contact: {
        eyebrow: "Contacto",
        title: "Trabajemos juntos",
        subtitle: "Abierto a roles Full Stack, Frontend senior y posiciones híbridas Dev/IT.",
      },
    },
    stack: [
      {
        category: "Frontend",
        items: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Custom Hooks", "memo / useMemo / useCallback"],
      },
      {
        category: "Arquitectura Next.js",
        items: ["SSR", "SSG", "ISR", "React Server Components", "Middleware", "CDN Caching", "SEO"],
      },
      {
        category: "TypeScript",
        items: ["Strict typing", "Generics", "Discriminated unions", "Utility types"],
      },
      {
        category: "Backend y datos",
        items: ["Node.js", "NestJS", "PostgreSQL", "MongoDB", "Diseño de APIs"],
      },
      {
        category: "APIs y resiliencia",
        items: ["REST", "OpenAPI", "Interceptors", "Retry logic", "Timeouts", "Fallback / degradación"],
      },
      {
        category: "Autenticación y seguridad",
        items: ["OAuth2 / OIDC", "JWT", "Refresh tokens", "2FA", "Okta", "Azure AD B2C", "CIAM"],
      },
      {
        category: "Cloud y DevOps",
        items: ["Docker", "Google Cloud Run", "CI/CD", "Git workflows", "Turborepo", "pnpm"],
      },
      {
        category: "Tiempo real y pagos",
        items: ["WebSockets", "Stripe API", "Firebase Cloud Messaging"],
      },
      {
        category: "Observabilidad",
        items: ["Logs estructurados", "Métricas", "Trazas distribuidas", "Gestión de incidentes"],
      },
      {
        category: "Infraestructura e identidad",
        items: ["Microsoft 365", "Intune", "Jamf", "Kaseya", "ZScaler", "VPN", "Windows Server"],
      },
    ],
    projects: [
      {
        name: "Crypto Portfolio Tracker",
        year: "Full-stack",
        description:
          "Aplicación full-stack construida en ~1 semana con 4–5 funcionalidades core sobre ~10 endpoints. Arquitectura dual Backend-for-Frontend (BFF), precios en tiempo real por WebSocket vía Coinbase, autenticación JWT y notificaciones push con Firebase, sobre PostgreSQL con separación de esquemas.",
        tags: ["NestJS", "Next.js", "Flutter", "WebSockets", "JWT", "PostgreSQL", "Firebase"],
      },
      {
        name: "Areia Bela — Vacation Rental Booking",
        year: "En desarrollo",
        description:
          "Plataforma de reservas para alquiler vacacional en monorepo (pnpm + Turborepo). Versión core en ~1 mes con 4–5 funcionalidades y 10+ endpoints. Desplegada en Google Cloud Run, con pagos Stripe y verificación de firma de webhooks.",
        tags: ["Next.js", "NestJS", "Turborepo", "GCP Cloud Run", "Stripe", "Webhooks"],
      },
      {
        name: "Banexcoin Bcore — Crypto Exchange",
        year: "Producción",
        description:
          "CMS e integraciones frontend para banexcoin.com y Banexcoin Bolivia, soportando funcionalidad core de exchange: flujos de trading, verificación de identidad (KYC) y conversión de pagos con stablecoins vía QR.",
        tags: ["React", "Next.js", "CMS", "KYC", "Trading", "Stablecoins"],
        href: "https://banexcoin.com",
      },
    ],
    experience: [
      {
        company: "Banexcoin SA",
        role: "Full Stack Developer & IT Infrastructure Manager",
        period: "Nov 2019 – Presente",
        location: "Lima, Perú",
        bullets: [
          "Desarrollo de aplicaciones web internas con React.js, Next.js, TypeScript, NestJS y Tailwind CSS para una plataforma FinTech con 1,000+ usuarios activos, aplicando SSR, SSG e ISR según el caso de uso.",
          "Patrones avanzados de TypeScript (strict typing, generics, discriminated unions, utility types) para mejorar seguridad y mantenibilidad del código.",
          "Capa de cliente HTTP con wrappers e interceptors: retry logic, timeouts y patrones de fallback/degradación para consumo resiliente de APIs.",
          "Flujos de autenticación seguros con JWT, 2FA y OAuth2/OIDC, incluyendo ciclo de vida de access y refresh tokens en contextos SSR y CSR; gestión de identidad con Okta.",
          "Optimización de performance y SEO: bundle optimization, middleware, estrategias de caché en CDN y routing de Next.js.",
          "Observabilidad con logs estructurados, métricas y trazas para resolución de incidentes en entornos FinTech.",
          "Soporte técnico Tier 1–3 para ~45 usuarios y dispositivos (Windows y macOS): −30 min en tiempo medio de resolución y −50% en backlog de tickets.",
          "Gestión del ciclo de vida de activos IT y endpoints con Intune, Jamf y Kaseya.",
        ],
      },
      {
        company: "Corsurp SAC",
        role: "IT Infrastructure Manager",
        period: "May 2013 – Sep 2019",
        location: "Lima, Perú",
        bullets: [
          "Diagnóstico de hardware, software y conectividad de red en múltiples sedes, reduciendo el downtime operativo con soporte proactivo.",
          "Administración de entornos Windows Server y soporte de onboarding/offboarding con documentación de sistemas.",
          "Inventario de activos IT y gestión del ciclo de vida de estaciones de trabajo alineado a estándares de seguridad.",
          "Soporte de sistemas VoIP, accesos remotos y operaciones técnicas de usuario final.",
        ],
      },
    ],
    certifications: [
      { name: "CompTIA A+", issuer: "En curso" },
      { name: "Desarrollo Seguro con Flutter", issuer: "Certificación" },
      { name: "AI Fluency: Framework & Foundations", issuer: "Anthropic" },
      { name: "Claude 101", issuer: "Anthropic" },
    ],
    education: [
      { title: "Full Stack Development", school: "Coderhouse — Buenos Aires, Argentina", period: "2022 – 2023" },
      {
        title: "Network & Communications Engineering",
        school: "ISIL Institute — Lima, Perú",
        period: "2016 – 2021",
      },
    ],
    languages: "Español — Nativo · Inglés — Básico",
    reposEmpty: "No hay repositorios públicos para mostrar por ahora.",
    footerNote: "Diseñado y construido por Erick Giraldo Muñoz",
  },
  en: {
    nav: {
      about: "Profile",
      stack: "Stack",
      projects: "Projects",
      repos: "GitHub",
      experience: "Experience",
      contact: "Contact",
    },
    cta: {
      downloadCv: "Download CV",
      contact: "Get in touch",
      linkedin: "LinkedIn",
      viewProject: "View project",
    },
    hero: {
      badge: "Open to new opportunities",
      role: "Full Stack Developer & IT Infrastructure",
      tagline:
        "12+ years building and sustaining FinTech platforms: React, Next.js, TypeScript, NestJS and Google Cloud, with a focus on API resilience, security and identity.",
      scroll: "Scroll",
    },
    metrics: [
      { value: "12+", label: "Years of experience" },
      { value: "1000+", label: "Active users supported" },
      { value: "6+", label: "Years in dual Dev/IT role" },
      { value: "50%", label: "Support backlog reduction" },
    ],
    sections: {
      stack: {
        eyebrow: "Capabilities",
        title: "Technology stack",
        subtitle: "Tools and practices I use daily in business-critical FinTech environments.",
      },
      projects: {
        eyebrow: "Work",
        title: "Featured projects",
        subtitle: "End-to-end products: architecture, backend, frontend and cloud deployment.",
      },
      repos: {
        eyebrow: "Code",
        title: "GitHub repositories",
        subtitle: "Public repositories, sorted by relevance.",
      },
      experience: {
        eyebrow: "Track record",
        title: "Professional experience",
        subtitle: "Product development and infrastructure, in parallel.",
      },
      credentials: {
        eyebrow: "Learning",
        title: "Certifications & education",
        subtitle: "Continuous learning across development, security and AI.",
      },
      contact: {
        eyebrow: "Contact",
        title: "Let's work together",
        subtitle: "Open to Full Stack, Senior Frontend and hybrid Dev/IT roles.",
      },
    },
    stack: [
      {
        category: "Frontend",
        items: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Custom Hooks", "memo / useMemo / useCallback"],
      },
      {
        category: "Next.js architecture",
        items: ["SSR", "SSG", "ISR", "React Server Components", "Middleware", "CDN caching", "SEO"],
      },
      {
        category: "TypeScript",
        items: ["Strict typing", "Generics", "Discriminated unions", "Utility types"],
      },
      {
        category: "Backend & data",
        items: ["Node.js", "NestJS", "PostgreSQL", "MongoDB", "API design"],
      },
      {
        category: "APIs & resilience",
        items: ["REST", "OpenAPI", "Interceptors", "Retry logic", "Timeouts", "Fallback / degradation"],
      },
      {
        category: "Auth & security",
        items: ["OAuth2 / OIDC", "JWT", "Refresh tokens", "2FA", "Okta", "Azure AD B2C", "CIAM"],
      },
      {
        category: "Cloud & DevOps",
        items: ["Docker", "Google Cloud Run", "CI/CD", "Git workflows", "Turborepo", "pnpm"],
      },
      {
        category: "Real-time & payments",
        items: ["WebSockets", "Stripe API", "Firebase Cloud Messaging"],
      },
      {
        category: "Observability",
        items: ["Structured logging", "Metrics", "Distributed tracing", "Incident response"],
      },
      {
        category: "Infrastructure & identity",
        items: ["Microsoft 365", "Intune", "Jamf", "Kaseya", "ZScaler", "VPN", "Windows Server"],
      },
    ],
    projects: [
      {
        name: "Crypto Portfolio Tracker",
        year: "Full-stack",
        description:
          "Full-stack app built in ~1 week, delivering 4–5 core features across ~10 API endpoints. Dual Backend-for-Frontend (BFF) architecture, real-time WebSocket price feeds via Coinbase, JWT authentication and Firebase push notifications, backed by PostgreSQL with schema separation.",
        tags: ["NestJS", "Next.js", "Flutter", "WebSockets", "JWT", "PostgreSQL", "Firebase"],
      },
      {
        name: "Areia Bela — Vacation Rental Booking",
        year: "In progress",
        description:
          "Whole-home vacation rental booking platform in a monorepo (pnpm + Turborepo). Core version built in ~1 month with 4–5 features and 10+ endpoints. Deployed on Google Cloud Run, with Stripe payments and webhook signature verification.",
        tags: ["Next.js", "NestJS", "Turborepo", "GCP Cloud Run", "Stripe", "Webhooks"],
      },
      {
        name: "Banexcoin Bcore — Crypto Exchange",
        year: "Production",
        description:
          "CMS and front-end integrations for banexcoin.com and Banexcoin Bolivia, supporting core exchange functionality: trading flows, KYC identity verification and QR-based stablecoin payment conversion.",
        tags: ["React", "Next.js", "CMS", "KYC", "Trading", "Stablecoins"],
        href: "https://banexcoin.com",
      },
    ],
    experience: [
      {
        company: "Banexcoin SA",
        role: "Full Stack Developer & IT Infrastructure Manager",
        period: "Nov 2019 – Present",
        location: "Lima, Peru",
        bullets: [
          "Built internal web applications with React.js, Next.js, TypeScript, NestJS and Tailwind CSS for a FinTech platform with 1,000+ active users, applying SSR, SSG and ISR per use case.",
          "Applied advanced TypeScript patterns (strict typing, generics, discriminated unions, utility types) to improve code safety and maintainability.",
          "Designed an HTTP client layer with wrappers and interceptors: retry logic, timeouts and fallback/degradation patterns for resilient API consumption.",
          "Implemented secure auth flows with JWT, 2FA and OAuth2/OIDC, including access and refresh token lifecycle in SSR and CSR contexts; identity management with Okta.",
          "Performance and SEO optimization: bundle optimization, middleware, CDN caching strategies and Next.js routing.",
          "Observability with structured logs, metrics and traces to support incident resolution in FinTech environments.",
          "Tier 1–3 support for ~45 users and devices (Windows and macOS): −30 min average resolution time and −50% ticket backlog.",
          "IT asset lifecycle and endpoint administration with Intune, Jamf and Kaseya.",
        ],
      },
      {
        company: "Corsurp SAC",
        role: "IT Infrastructure Manager",
        period: "May 2013 – Sep 2019",
        location: "Lima, Peru",
        bullets: [
          "Troubleshot hardware, software and network connectivity across multiple locations, reducing downtime through proactive support.",
          "Managed Windows Server environments and supported onboarding/offboarding with system administration and documentation.",
          "Maintained IT asset inventory and workstation lifecycle aligned with company security standards.",
          "Supported VoIP systems, remote access technologies and end-user technical operations.",
        ],
      },
    ],
    certifications: [
      { name: "CompTIA A+", issuer: "In progress" },
      { name: "Secure Flutter Development", issuer: "Certification" },
      { name: "AI Fluency: Framework & Foundations", issuer: "Anthropic" },
      { name: "Claude 101", issuer: "Anthropic" },
    ],
    education: [
      { title: "Full Stack Development", school: "Coderhouse — Buenos Aires, Argentina", period: "2022 – 2023" },
      { title: "Network & Communications Engineering", school: "ISIL Institute — Lima, Peru", period: "2016 – 2021" },
    ],
    languages: "Spanish — Native · English — Basic",
    reposEmpty: "No public repositories to show yet.",
    footerNote: "Designed and built by Erick Giraldo Muñoz",
  },
};
