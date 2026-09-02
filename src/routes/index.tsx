import { createFileRoute } from "@tanstack/react-router";
import { LangProvider } from "@/components/landing/lang-context";
import { ThemeProvider } from "@/components/landing/theme-context";
import { AuroraBackdrop, CursorSpotlight, ScrollProgress } from "@/components/landing/effects";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";

import {
  ContactSection,
  CredentialsSection,
  ExperienceSection,
  ProjectsSection,
  ReposSection,
  StackSection,
} from "@/components/landing/sections";
import { profile } from "@/content/cv";

const title = "Erick Giraldo Muñoz — Full Stack Developer & IT Infrastructure";
const description =
  "Full Stack Developer con 12+ años en FinTech: React, Next.js, TypeScript, NestJS, Docker y Google Cloud. Proyectos, experiencia y contacto.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "Full Stack Developer & IT Infrastructure Manager",
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  address: { "@type": "PostalAddress", addressLocality: "Holbrook", addressRegion: "NY", addressCountry: "US" },
  sameAs: [profile.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "NestJS", "Google Cloud Platform", "Docker", "OAuth2", "FinTech"],
};

function Index() {
  return (
    <ThemeProvider>
      <LangProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AuroraBackdrop />
        <ScrollProgress />
        <CursorSpotlight />
        <Nav />
        <main className="relative z-10">
          <Hero />
          <StackSection />
          <ProjectsSection />
          <ReposSection />
          <ExperienceSection />
          <CredentialsSection />
          <ContactSection />
        </main>
      </LangProvider>
    </ThemeProvider>
  );
}
