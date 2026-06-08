import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UtilityHub - All-in-One Online Web Utilities",
    short_name: "UtilityHub",
    description: "Access clean, fast, secure online tools for passwords, QR codes, conversions, age calculations, timezone tracking, and url shortening.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon"
      }
    ]
  };
}
