import type { Metadata } from "next";
import { LangProvider } from "@/components/landing/lang-context";
import { ThemeProvider } from "@/components/landing/theme-context";
import { FrameRails, IntroLoader } from "@/components/landing/effects";
import { Dock, Nav } from "@/components/landing/nav";
import { CursorField } from "@/components/landing/cursor-field";
import { SoundEffects, SoundWidget } from "@/components/landing/sound";
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

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "profile" },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "Full Stack Developer & IT Infrastructure Manager",
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Holbrook",
    addressRegion: "NY",
    addressCountry: "US",
  },
  sameAs: [profile.linkedin],
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "NestJS",
    "Google Cloud Platform",
    "Docker",
    "OAuth2",
    "FinTech",
  ],
};

export default function Home() {
  return (
    <ThemeProvider>
      <LangProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <IntroLoader />
        <FrameRails />
        <CursorField />
        <SoundEffects />
        <Nav />
        <Dock />
        <SoundWidget />
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
