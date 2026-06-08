"use client";

import Link from "next/link";
import { Wrench, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Wrench className="h-5 w-5" />
              <span>UtilityHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Your comprehensive, all-in-one suite of modern web utilities. 
              Generate secure passwords, analyze safety strength, convert between units, 
              plan meetings across timezones, scan/generate QR codes, and more. 
              Fast, client-side focused, secure, and open-source.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Security & Dev</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/tools/password-generator" className="hover:text-primary transition-colors">Password Generator</Link></li>
                  <li><Link href="/tools/password-strength" className="hover:text-primary transition-colors">Strength Checker</Link></li>
                  <li><Link href="/tools/qr-generator" className="hover:text-primary transition-colors">QR Generator</Link></li>
                  <li><Link href="/tools/qr-scanner" className="hover:text-primary transition-colors">QR Scanner</Link></li>
                </ul>
              </div>
              <div className="mt-8 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Converters</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/tools/unit-converter" className="hover:text-primary transition-colors">Unit Converter</Link></li>
                  <li><Link href="/tools/timezone-converter" className="hover:text-primary transition-colors">Time Zone Converter</Link></li>
                  <li><Link href="/tools/url-shortener" className="hover:text-primary transition-colors">URL Shortener</Link></li>
                  <li><Link href="/tools/age-calculator" className="hover:text-primary transition-colors">Age Calculator</Link></li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Project</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                <li><span className="text-xs text-muted-foreground flex items-center gap-1 mt-4">Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for utility</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} UtilityHub. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
