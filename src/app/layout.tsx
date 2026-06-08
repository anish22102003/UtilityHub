import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UtilityHub - All-in-One Online Web Utilities",
    template: "%s | UtilityHub"
  },
  description: "A secure, fast, and feature-rich suite of online utility tools including QR generator/scanner, password manager, unit/timezone converters, age calculator, and URL shortener.",
  keywords: ["utility tools", "QR generator", "QR scanner", "password generator", "URL shortener", "timezone converter", "unit converter", "age calculator"],
  authors: [{ name: "UtilityHub Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://utilityhub.vercel.app",
    title: "UtilityHub - All-in-One Online Web Utilities",
    description: "A secure, fast, and feature-rich suite of online utility tools.",
    siteName: "UtilityHub"
  },
  twitter: {
    card: "summary_large_image",
    title: "UtilityHub - All-in-One Online Web Utilities",
    description: "A secure, fast, and feature-rich suite of online utility tools."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
