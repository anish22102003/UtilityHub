import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://utilityhub.vercel.app";
  
  const tools = [
    "qr-generator",
    "qr-scanner",
    "password-generator",
    "password-strength",
    "url-shortener",
    "age-calculator",
    "unit-converter",
    "timezone-converter"
  ];

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0
    },
    ...toolUrls
  ];
}
