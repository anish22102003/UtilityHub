"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Calendar, 
  ArrowLeft, 
  Copy, 
  Check, 
  Clock, 
  Hourglass, 
  Gift, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

export default function AgeCalculator() {
  const [birthDateStr, setBirthDateStr] = React.useState("1995-01-01");
  const [targetDateStr, setTargetDateStr] = React.useState(new Date().toISOString().split("T")[0]);
  
  const [ageYears, setAgeYears] = React.useState<number | null>(null);
  const [ageMonths, setAgeMonths] = React.useState<number | null>(null);
  const [ageDays, setAgeDays] = React.useState<number | null>(null);
  
  // Total stats
  const [totalDays, setTotalDays] = React.useState<number | null>(null);
  const [totalWeeks, setTotalWeeks] = React.useState<number | null>(null);
  const [totalMonths, setTotalMonths] = React.useState<number | null>(null);
  const [totalHours, setTotalHours] = React.useState<number | null>(null);

  // Next birthday countdown states
  const [countdownDays, setCountdownDays] = React.useState(0);
  const [countdownHours, setCountdownHours] = React.useState(0);
  const [countdownMinutes, setCountdownMinutes] = React.useState(0);
  const [countdownSeconds, setCountdownSeconds] = React.useState(0);

  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("Age Calculator");
  }, []);

  const calculateAge = React.useCallback(() => {
    if (!birthDateStr) return;
    
    const birth = new Date(birthDateStr);
    const target = new Date(targetDateStr || new Date());
    
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return;
    if (birth > target) {
      setAgeYears(0);
      setAgeMonths(0);
      setAgeDays(0);
      setTotalDays(0);
      setTotalWeeks(0);
      setTotalMonths(0);
      setTotalHours(0);
      return;
    }

    // Years, Months, Days calculation
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      // Days of the previous month
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    setAgeYears(years);
    setAgeMonths(months);
    setAgeDays(days);

    // Totals calculations
    const diffMs = target.getTime() - birth.getTime();
    const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    setTotalDays(daysDiff);
    setTotalWeeks(Math.floor(daysDiff / 7));
    setTotalHours(Math.floor(diffMs / (1000 * 60 * 60)));
    
    const totalM = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
    setTotalMonths(totalM);
  }, [birthDateStr, targetDateStr]);

  // Live countdown to next birthday
  React.useEffect(() => {
    calculateAge();

    const timer = setInterval(() => {
      if (!birthDateStr) return;

      const birth = new Date(birthDateStr);
      if (isNaN(birth.getTime())) return;

      const today = new Date();
      const birthMonth = birth.getMonth();
      const birthDay = birth.getDate();

      let nextBday = new Date(today.getFullYear(), birthMonth, birthDay);
      
      // If birthday has passed this year, set next year
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }

      const diffMs = nextBday.getTime() - today.getTime();

      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdownDays(d);
      setCountdownHours(h);
      setCountdownMinutes(m);
      setCountdownSeconds(s);
    }, 1000);

    return () => clearInterval(timer);
  }, [birthDateStr, calculateAge]);

  const getAgeSummaryText = () => {
    if (ageYears === null) return "";
    return `My age is ${ageYears} years, ${ageMonths} months, and ${ageDays} days. (Total: ${totalDays} days)`;
  };

  const copyResult = () => {
    const txt = getAgeSummaryText();
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Calendar className="h-8 w-8 text-primary" />
            Age Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Compute your exact age down to the day and track the live countdown to your next birthday.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold border-b border-border pb-2">Select Dates</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold block">Date of Birth</label>
              <input
                type="date"
                value={birthDateStr}
                onChange={(e) => setBirthDateStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold block">Age at the Date of (Optional)</label>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {ageYears !== null ? (
            <div className="space-y-6">
              {/* Main Age Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Exact Age</h3>
                    <div className="mt-2 flex flex-wrap gap-4 items-baseline">
                      <span className="text-5xl font-extrabold text-foreground">{ageYears}<span className="text-lg font-semibold text-muted-foreground ml-1">years</span></span>
                      <span className="text-3xl font-extrabold text-foreground">{ageMonths}<span className="text-sm font-semibold text-muted-foreground ml-1">months</span></span>
                      <span className="text-3xl font-extrabold text-foreground">{ageDays}<span className="text-sm font-semibold text-muted-foreground ml-1">days</span></span>
                    </div>
                  </div>
                  <button
                    onClick={copyResult}
                    className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all shadow-sm"
                    title="Copy Result Text"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Grid of total conversions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4">
                  <div className="p-3 bg-secondary rounded-xl text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Total Months</span>
                    <span className="text-lg font-extrabold font-mono text-foreground">{totalMonths}</span>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Total Weeks</span>
                    <span className="text-lg font-extrabold font-mono text-foreground">{totalWeeks}</span>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Total Days</span>
                    <span className="text-lg font-extrabold font-mono text-foreground">{totalDays}</span>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl text-center">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Total Hours</span>
                    <span className="text-lg font-extrabold font-mono text-foreground">{totalHours}</span>
                  </div>
                </div>
              </div>

              {/* Birthday Countdown Card */}
              <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Gift className="h-5 w-5" />
                  <span>Birthday Countdown</span>
                </div>
                <div className="grid grid-cols-4 gap-3 max-w-sm">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-card border border-border">
                    <span className="text-2xl font-extrabold font-mono text-foreground">{countdownDays}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Days</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-card border border-border">
                    <span className="text-2xl font-extrabold font-mono text-foreground">{countdownHours}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Hours</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-card border border-border">
                    <span className="text-2xl font-extrabold font-mono text-foreground">{countdownMinutes}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Mins</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-card border border-border">
                    <span className="text-2xl font-extrabold font-mono text-foreground">{countdownSeconds}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Secs</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Live countdown ticking to your next birthday anniversary.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center text-center min-h-[200px] text-muted-foreground">
              Select your date of birth on the left to see your full age breakdown and next birthday countdown.
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">Age Calculator FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">How does the calculator compute calendar age?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Age is calculated relative to actual calendar boundaries (handling variations in month lengths like 28, 30, and 31 days, as well as leap years), borrowing days from preceding months where necessary to maintain exact accuracy.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Is my birthday date stored anywhere?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              No. All age computations are performed locally on your device within the browser scripts. The inputs are not logged or stored online.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/timezone-converter"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Time Zone Converter</h4>
              <p className="text-xs text-muted-foreground mt-1">Compare local times and plan meetings globally.</p>
            </div>
            <Hourglass className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/unit-converter"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Unit Converter</h4>
              <p className="text-xs text-muted-foreground mt-1">Convert between speed, storage, weight and length.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
