"use client";

import * as React from "react";
import Link from "next/link";
import { 
  KeyRound, 
  Copy, 
  Check, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  History,
  Lock
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

export default function PasswordGenerator() {
  const [length, setLength] = React.useState(16);
  const [includeLower, setIncludeLower] = React.useState(true);
  const [includeUpper, setIncludeUpper] = React.useState(true);
  const [includeNumbers, setIncludeNumbers] = React.useState(true);
  const [includeSymbols, setIncludeSymbols] = React.useState(true);
  
  const [password, setPassword] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("Password Generator");
  }, []);

  const generatePassword = React.useCallback(() => {
    let pool = "";
    if (includeLower) pool += LOWERCASE;
    if (includeUpper) pool += UPPERCASE;
    if (includeNumbers) pool += NUMBERS;
    if (includeSymbols) pool += SYMBOLS;

    if (!pool) {
      setPassword("Please select at least one option");
      return;
    }

    let generated = "";
    const randomValues = new Uint32Array(length);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        generated += pool[randomValues[i] % pool.length];
      }
    } else {
      // Fallback for non-browser compilation
      for (let i = 0; i < length; i++) {
        generated += pool[Math.floor(Math.random() * pool.length)];
      }
    }

    setPassword(generated);
    setHistory((prev) => [generated, ...prev.slice(0, 9)]);
  }, [length, includeLower, includeUpper, includeNumbers, includeSymbols]);

  React.useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Entropy: E = L * log2(R)
  const getEntropy = () => {
    let poolSize = 0;
    if (includeLower) poolSize += 26;
    if (includeUpper) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 29; // standard symbols length used here is 29

    if (poolSize === 0) return 0;
    const bitsPerChar = Math.log2(poolSize);
    return Math.round(length * bitsPerChar);
  };

  const getEntropyDetails = () => {
    const entropy = getEntropy();
    if (entropy === 0) return { label: "N/A", color: "text-muted-foreground", bg: "bg-muted", pct: 0 };
    if (entropy < 40) return { label: "Very Weak", color: "text-destructive", bg: "bg-destructive/10", pct: 20 };
    if (entropy < 60) return { label: "Weak", color: "text-orange-500", bg: "bg-orange-500/10", pct: 45 };
    if (entropy < 80) return { label: "Good", color: "text-yellow-500", bg: "bg-yellow-500/10", pct: 70 };
    return { label: "Strong & Secure", color: "text-green-500", bg: "bg-green-500/10", pct: 100 };
  };

  const { label, color, bg, pct } = getEntropyDetails();
  const entropyBits = getEntropy();

  return (
    <div className="space-y-10">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <KeyRound className="h-8 w-8 text-primary" />
            Password Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate highly secure, random passwords on your local device.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold border-b border-border pb-2">Configuration</h2>
            
            {/* Length selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Password Length</span>
                <span className="text-primary font-mono text-base">{length} characters</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Checkboxes grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold block">Lowercase</label>
                  <span className="text-[10px] text-muted-foreground">abc...</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded border-border text-primary h-4.5 w-4.5"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold block">Uppercase</label>
                  <span className="text-[10px] text-muted-foreground">ABC...</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded border-border text-primary h-4.5 w-4.5"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold block">Numbers</label>
                  <span className="text-[10px] text-muted-foreground">123...</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-border text-primary h-4.5 w-4.5"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold block">Symbols</label>
                  <span className="text-[10px] text-muted-foreground">!@#...</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-border text-primary h-4.5 w-4.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <h3 className="font-bold text-lg text-foreground">Generated Password</h3>
            
            {/* Display Output Box */}
            <div className="relative group">
              <div className="w-full px-4 py-4 pr-12 rounded-xl border border-border bg-background font-mono text-sm break-all select-all min-h-[56px] flex items-center justify-start text-foreground tracking-wider">
                {password}
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(password)}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy Password"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={generatePassword}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Entropy security assessment meter */}
            <div className="space-y-2.5 border-t border-border pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Entropy Strength
                </span>
                <span className={`font-bold uppercase ${color} ${bg} px-2 py-0.5 rounded text-[10px]`}>
                  {label}
                </span>
              </div>
              
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    pct <= 20 ? "bg-destructive" :
                    pct <= 45 ? "bg-orange-500" :
                    pct <= 70 ? "bg-yellow-500" : "bg-green-500"
                  }`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Score: <b className="font-semibold text-foreground">{entropyBits} bits</b> of entropy</span>
                <span>Minimum recommended: 60 bits</span>
              </div>
            </div>

            {/* History Toggle */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                <History className="h-3.5 w-3.5" />
                <span>{showHistory ? "Hide Password History" : "Show Recent Passwords"}</span>
              </button>
              
              {showHistory && (
                <div className="mt-3 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {history.length > 0 ? (
                    history.map((pw, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg border border-border bg-background text-[11px] font-mono select-all break-all">
                        <span className="truncate max-w-[200px]">{pw}</span>
                        <button
                          onClick={() => copyToClipboard(pw)}
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground ml-2"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-muted-foreground text-center py-2">No history yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">Password Generator FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">How does password entropy protect my account?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Entropy measures a password&apos;s unpredictability in bits. Higher entropy means it would take modern supercomputers billions of years of trial-and-error calculations to perform a successful brute-force attack. Any password with more than 60 bits of entropy is considered highly robust.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Where are my passwords generated?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your passwords are generated purely client-side using JavaScript&apos;s `window.crypto.getRandomValues` API, which creates cryptographically strong pseudo-random numbers. Absolutely no data is transmitted to the internet.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/password-strength"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Password Strength Checker</h4>
              <p className="text-xs text-muted-foreground mt-1">Check vulnerabilities of your current passwords.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/qr-generator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">QR Code Generator</h4>
              <p className="text-xs text-muted-foreground mt-1">Encode secret keys as QR codes.</p>
            </div>
            <KeyRound className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
