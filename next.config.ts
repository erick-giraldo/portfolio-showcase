import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets the dev server be opened as 127.0.0.1 as well as localhost.
  allowedDevOrigins: ["127.0.0.1"],
  // Keep the dev badge clear of the language/theme dock in the bottom-left corner.
  devIndicators: { position: "top-left" },
};

export default nextConfig;
