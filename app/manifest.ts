import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XIVIZLEY — Görsel Homelab & Docker Mimari Tasarım",
    short_name: "XIVIZLEY",
    description: "Görsel olarak Homelab ve Docker mimarisi tasarlayın, port çakışmalarını önleyin ve tek tıkla kurun.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090e",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
