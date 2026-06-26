"use client";

import * as React from "react";
import Link from "next/link";
import { 
  QrCode, 
  ScanQrCode, 
  KeyRound, 
  ShieldCheck, 
  Link2, 
  Calendar, 
  ArrowLeftRight, 
  Clock, 
  Search, 
  ArrowRight,
  Shield, 
  Zap, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolItem {
  id: string;
  name: string;
  description: string;
  href: string;
  category: "Security" | "Developer" | "Calculators & Converters";
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
}

const tools: ToolItem[] = [
  {
    id: "qr-gen",
    name: "QR Code Generator",
    description: "Generate high-quality, customizable QR codes for text, URLs, email, WiFi, and phone numbers in PNG or SVG.",
    href: "/tools/qr-generator",
    category: "Developer",
    icon: QrCode,
    popular: true
  },
  {
    id: "qr-scan",
    name: "QR Code Scanner",
    description: "Instantly scan and extract content from QR codes using your device webcam or file uploads.",
    href: "/tools/qr-scanner",
    category: "Developer",
    icon: ScanQrCode
  },
  {
    id: "pass-gen",
    name: "Password Generator",
    description: "Create strong, cryptographically secure passwords with custom criteria and entropy strength evaluation.",
    href: "/tools/password-generator",
    category: "Security",
    icon: KeyRound,
    popular: true
  },
  {
    id: "pass-strength",
    name: "Password Strength Checker",
    description: "Analyze your passwords in real-time to check vulnerability, character distribution, and suggestions.",
    href: "/tools/password-strength",
    category: "Security",
    icon: ShieldCheck
  },
  {
    id: "url-short",
    name: "URL Shortener",
    description: "Convert long URLs into compact links with click counters, custom slugs, and QR codes.",
    href: "/tools/url-shortener",
    category: "Developer",
    icon: Link2,
    popular: true
  },
  {
    id: "age-calc",
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, and days, and see a live countdown to your next birthday.",
    href: "/tools/age-calculator",
    category: "Calculators & Converters",
    icon: Calendar
  },
  {
    id: "unit-conv",
    name: "Unit Converter",
    description: "Easily convert between Length, Weight, Temperature, Area, Volume, Speed, and Data Storage units.",
    href: "/tools/unit-converter",
    category: "Calculators & Converters",
    icon: ArrowLeftRight,
    popular: true
  },
  {
    id: "tz-conv",
    name: "Time Zone Converter",
    description: "Compare multiple cities, view local offsets, and plan global meetings with visual working hour markers.",
    href: "/tools/timezone-converter",
    category: "Calculators & Converters",
    icon: Clock
  }
];

const faqs = [
  {
    q: "Are the tools secure to use? Does my data get uploaded?",
    a: "Absolutely. Most of our tools (like Password Generator, Strength Checker, QR Scanner, QR Generator, and Converters) run entirely in your web browser. No inputs or passwords are ever sent to our servers. Only dynamic URL redirects and tool hits are stored securely in our database."
  },
  {
    q: "How does the URL Shortener work?",
    a: "Our URL Shortener takes a long link, generates a unique code (or utilizes your custom slug), and creates a record in our PostgreSQL database. When visitors click the short URL, our route redirects them instantly to the destination while logging basic, anonymous referrer statistics."
  },
  {
    q: "Can I download the QR Codes in vector formats?",
    a: "Yes! Our QR Code Generator supports exporting QR codes in both PNG (raster) and SVG (vector) formats, allowing you to use them in print and digital designs without losing quality."
  },
  {
    q: "Is the Time Zone Converter meeting planner customizable?",
    a: "Yes! It displays color-coded segments representing standard working hours (9:00 AM - 5:00 PM), personal hours, and sleeping hours, helping you coordinate international meetings easily."
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const categories = ["All", "Security", "Developer", "Calculators & Converters"];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTools = tools.filter((t) => t.popular);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
        >
          <Sparkles className="h-3 w-3" />
          <span>Your ultimate, secure utility dashboard</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent leading-none"
        >
          Simplify Your Digital Workspace
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Access clean, fast, and private online tools for passwords, QR codes, conversions, age calculations, timezone tracking, and url shortening.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-md mx-auto relative mt-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search utilities (e.g., 'password', 'QR')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            id="tool-search"
          />
        </motion.div>
      </section>

      {/* Popular Tools Grid */}
      {searchQuery === "" && activeCategory === "All" && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Popular Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  whileHover={{ y: -4 }}
                  className="group relative p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{tool.description}</p>
                  </div>
                  <Link href={tool.href} className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    <span>Open Tool</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Categories & Tools Directory */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Tools Directory</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Cards Grid */}
        <AnimatePresence mode="popLayout">
          {filteredTools.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={tool.id}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-primary/45 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-secondary text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-secondary text-muted-foreground">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <Link
                      href={tool.href}
                      className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-semibold text-foreground transition-all"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No tools found matching your criteria. Try adjusting your search term.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">Got questions? We have answers. Learn about the security and operation of ToolMitra.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div 
                key={index} 
                className="border-b border-border last:border-0 pb-4 last:pb-0"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between py-3 text-left font-bold text-base sm:text-lg hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="prose dark:prose-invert max-w-4xl mx-auto text-center border-t border-border pt-12 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Why choose ToolMitra as your default toolset?</h2>
        <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          ToolMitra provides a comprehensive web toolkit featuring a fully client-side design system. Unlike other developer or utility services, ToolMitra does not track your personal inputs. Your files, barcodes, passwords, and custom data remain in your browser. We focus on lightweight page payloads, maximum performance, and mobile accessibility, making it perfect for bookmarks, mobile quick access, and workflow automation.
        </p>
      </section>
    </div>
  );
}
