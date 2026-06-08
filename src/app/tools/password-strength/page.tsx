"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  KeyRound, 
  Check, 
  X, 
  Info,
  Clock,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

const COMMON_PASSWORDS = [
  "password", "123456", "123456789", "qwerty", "12345", 
  "admin", "welcome", "letmein", "monkey", "sunshine", 
  "football", "iloveyou", "password123", "secret", "login"
];

export default function PasswordStrengthChecker() {
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("Password Strength Checker");
  }, []);

  // Check character sets
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

  // Suggestions list
  const getSuggestions = () => {
    const list: string[] = [];
    if (!password) return list;

    if (password.length < 8) {
      list.push("Make it longer. Standard accounts require at least 8 characters.");
    } else if (password.length < 12) {
      list.push("Increase length to 12+ characters for server/admin grade security.");
    }

    if (!hasLower) list.push("Add lowercase letters (a-z).");
    if (!hasUpper) list.push("Add uppercase letters (A-Z).");
    if (!hasNumber) list.push("Add numeric digits (0-9).");
    if (!hasSymbol) list.push("Add special symbols (!@#$...).");
    
    if (isCommon) {
      list.push("Avoid common or dictionary passwords. This password is listed in threat leak databases.");
    }

    // Check for repetitive letters
    if (/(.)\1\1/.test(password)) {
      list.push("Avoid repeating three identical characters sequentially (e.g., 'aaa' or '111').");
    }

    return list;
  };

  // Score computation (0-100)
  const getScore = () => {
    if (!password) return 0;
    
    let baseScore = 0;
    
    // Length contribution
    baseScore += Math.min(password.length * 6, 40); // 12 chars = 40 points

    // Variety contribution
    if (hasLower) baseScore += 15;
    if (hasUpper) baseScore += 15;
    if (hasNumber) baseScore += 15;
    if (hasSymbol) baseScore += 15;

    // Deductions
    if (isCommon) baseScore = Math.max(baseScore - 60, 5);
    
    return Math.min(baseScore, 100);
  };

  // Get qualitative rating
  const getRating = () => {
    const score = getScore();
    if (!password) return { text: "Too Short", color: "text-muted-foreground", bg: "bg-secondary", pct: 0 };
    if (score < 40) return { text: "Weak", color: "text-destructive", bg: "bg-destructive/10", pct: 25 };
    if (score < 65) return { text: "Fair", color: "text-orange-500", bg: "bg-orange-500/10", pct: 50 };
    if (score < 85) return { text: "Good", color: "text-yellow-500", bg: "bg-yellow-500/10", pct: 75 };
    return { text: "Strong & Safe", color: "text-green-500", bg: "bg-green-500/10", pct: 100 };
  };

  // Calculate brute force duration
  const getCrackTime = () => {
    if (!password) return "N/A";

    let pool = 0;
    if (hasLower) pool += 26;
    if (hasUpper) pool += 26;
    if (hasNumber) pool += 10;
    if (hasSymbol) pool += 33;

    if (pool === 0) return "Instantly";

    // Combos: pool ^ length
    const combos = Math.pow(pool, password.length);
    
    // Assume 10 billion guesses/sec
    const guessesPerSec = 10_000_000_000;
    const seconds = combos / guessesPerSec;

    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;

    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;

    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;

    const years = days / 365;
    if (years < 100) return `${Math.round(years)} years`;
    if (years < 10_000) return `${Math.round(years)} years`;
    if (years < 1_000_000) return "Thousands of years";
    if (years < 1_000_000_000) return "Millions of years";
    return "Trillions of years (Uncrackable)";
  };

  const score = getScore();
  const { text: ratingText, color: ratingColor, bg: ratingBg, pct: progressPct } = getRating();
  const suggestions = getSuggestions();
  const crackTime = getCrackTime();

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
            <ShieldCheck className="h-8 w-8 text-primary" />
            Password Strength Checker
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze your password security locally to identify vulnerabilities and crack estimates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs and Checks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-bold block">Enter Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type a password to test..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="strength-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Checklist of elements */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Character Requirements</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs">
                  {hasLower ? (
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check className="h-3.5 w-3.5" /></div>
                  ) : (
                    <div className="p-1 rounded-full bg-secondary text-muted-foreground"><X className="h-3.5 w-3.5" /></div>
                  )}
                  <span className={hasLower ? "text-foreground font-semibold" : "text-muted-foreground"}>Lowercase letters</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {hasUpper ? (
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check className="h-3.5 w-3.5" /></div>
                  ) : (
                    <div className="p-1 rounded-full bg-secondary text-muted-foreground"><X className="h-3.5 w-3.5" /></div>
                  )}
                  <span className={hasUpper ? "text-foreground font-semibold" : "text-muted-foreground"}>Uppercase letters</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {hasNumber ? (
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check className="h-3.5 w-3.5" /></div>
                  ) : (
                    <div className="p-1 rounded-full bg-secondary text-muted-foreground"><X className="h-3.5 w-3.5" /></div>
                  )}
                  <span className={hasNumber ? "text-foreground font-semibold" : "text-muted-foreground"}>Numeric digits</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {hasSymbol ? (
                    <div className="p-1 rounded-full bg-green-500/10 text-green-500"><Check className="h-3.5 w-3.5" /></div>
                  ) : (
                    <div className="p-1 rounded-full bg-secondary text-muted-foreground"><X className="h-3.5 w-3.5" /></div>
                  )}
                  <span className={hasSymbol ? "text-foreground font-semibold" : "text-muted-foreground"}>Special symbols</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions card */}
          {password && suggestions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="font-bold text-sm text-destructive flex items-center gap-1">
                <Info className="h-4 w-4" />
                Security Recommendations
              </h3>
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                {suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          {password && suggestions.length === 0 && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl p-6 flex items-start gap-3 shadow-sm">
              <Check className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Perfect Score!</h3>
                <p className="text-xs text-green-600/80 mt-1">
                  Your password follows all modern industry security conventions. It is long, complex, and highly resistant to offline dictionary leaks or brute force scripts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Audit Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <h3 className="font-bold text-lg text-foreground">Security Audit</h3>
            
            {/* Score & Gauge */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Security Score
                </span>
                <span className={`font-bold uppercase ${ratingColor} ${ratingBg} px-2 py-0.5 rounded text-[10px]`}>
                  {ratingText}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold font-mono text-foreground">{score}<span className="text-sm font-semibold text-muted-foreground">/100</span></span>
                <div className="h-3 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      progressPct <= 25 ? "bg-destructive" :
                      progressPct <= 50 ? "bg-orange-500" :
                      progressPct <= 75 ? "bg-yellow-500" : "bg-green-500"
                    }`} 
                    style={{ width: `${progressPct}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Brute force time gauge */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Estimated Time to Crack</span>
              </div>
              <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Offline GPU Brute-Force:</span>
                <span className="text-sm font-bold text-foreground font-mono">{crackTime}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                * Based on a standard dictionary script running at 10 billion checks per second (a typical GPU hacker rig speed).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">Strength Checker FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Is it safe to type my actual passwords here?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Yes, because this analyzer works entirely offline inside your browser. No keystroke logging, caching, or remote connections take place. However, as a general rule, we recommend checking a *variation* of your actual password instead of the exact characters if you want to be extra cautious.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Why is password length more important than complexity?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Every added character increases the search space exponentially ($R^L$), which multiplies the computation time by the entire pool size. Thus, a simple 16-character sentence is much harder to hack than a complex 8-character string filled with symbols.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/password-generator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Password Generator</h4>
              <p className="text-xs text-muted-foreground mt-1">Create cryptographically strong password strings.</p>
            </div>
            <KeyRound className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/qr-generator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">QR Code Generator</h4>
              <p className="text-xs text-muted-foreground mt-1">Encode texts and keys inside barcodes.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
