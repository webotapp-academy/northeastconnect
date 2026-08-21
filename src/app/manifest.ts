import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "North East Connect",
    short_name: "NE Connect",
    description: "Northeast India Community, Social Hub, Travel & Local Directory",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
