import type { Metadata } from "next";
import { AdminPage } from "./AdminPage";

const title = "Panel de administración — Erick Giraldo";
const description = "Editor privado de textos, enlaces y archivos del portafolio.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPage />;
}
