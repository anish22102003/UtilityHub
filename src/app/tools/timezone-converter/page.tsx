"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Clock, 
  ArrowLeft, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeftRight,
  Globe
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

interface CityOption {
  name: string;
  zone: string;
}

const POPULAR_CITIES: CityOption[] = [
  { name: "New York (EST/EDT)", zone: "America/New_York" },
  { name: "London (GMT/BST)", zone: "Europe/London" },
  { name: "Tokyo (JST)", zone: "Asia/Tokyo" },
  { name: "Sydney (AEST/AEDT)", zone: "Australia/Sydney" },
  { name: "Dubai (GST)", zone: "Asia/Dubai" },
  { name: "Mumbai (IST)", zone: "Asia/Kolkata" },
  { name: "Paris (CET/CEST)", zone: "Europe/Paris" },
  { name: "San Francisco (PST/PDT)", zone: "America/Los_Angeles" },
  { name: "Singapore (SGT)", zone: "Asia/Singapore" },
  { name: "Hong Kong (HKT)", zone: "Asia/Hong_Kong" }
];

export default function TimeZoneConverter() {
  const [selectedCities, setSelectedCities] = React.useState<CityOption[]>([]);
  const [cityToAdd, setCityToAdd] = React.useState(POPULAR_CITIES[0].zone);
  
  // Meeting planner slider value (0 to 23 hours in local timezone)
  const [selectedHour, setSelectedHour] = React.useState(new Date().getHours());
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  
  const [liveTime, setLiveTime] = React.useState<Date | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("Time Zone Converter");
    setLiveTime(new Date());

    // Set default selected cities
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedCities([
      { name: "My Location", zone: localZone },
      { name: "New York", zone: "America/New_York" },
      { name: "London", zone: "Europe/London" }
    ]);

    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addCity = () => {
    const cityObj = POPULAR_CITIES.find((c) => c.zone === cityToAdd);
    if (!cityObj) return;

    // Avoid duplicate check
    if (selectedCities.some((c) => c.zone === cityObj.zone)) {
      alert("This timezone is already added.");
      return;
    }

    setSelectedCities([...selectedCities, { name: cityObj.name.split(" ")[0], zone: cityObj.zone }]);
  };

  const removeCity = (zoneToRemove: string) => {
    if (selectedCities.length <= 1) {
      alert("Please keep at least one timezone.");
      return;
    }
    setSelectedCities(selectedCities.filter((c) => c.zone !== zoneToRemove));
  };

  // Convert hour in source timezone to target timezone
  const getConvertedTimeStr = (targetZone: string) => {
    try {
      const year = parseInt(selectedDate.split("-")[0]);
      const month = parseInt(selectedDate.split("-")[1]) - 1;
      const day = parseInt(selectedDate.split("-")[2]);

      // Construct date object using local timezone source hour
      const sourceDate = new Date(year, month, day, selectedHour, 0, 0);
      
      return sourceDate.toLocaleString("en-US", {
        timeZone: targetZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    } catch (_) {
      return "N/A";
    }
  };

  const getHourInTimezone = (targetZone: string) => {
    try {
      const year = parseInt(selectedDate.split("-")[0]);
      const month = parseInt(selectedDate.split("-")[1]) - 1;
      const day = parseInt(selectedDate.split("-")[2]);

      const sourceDate = new Date(year, month, day, selectedHour, 0, 0);
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: targetZone,
        hour: "numeric",
        hour12: false
      }).formatToParts(sourceDate);

      const hrPart = parts.find(p => p.type === "hour");
      return hrPart ? parseInt(hrPart.value) : 0;
    } catch (_) {
      return 0;
    }
  };

  // Check hour category (Work / Sleep / Personal)
  const getHourCategory = (hr: number) => {
    if (hr >= 9 && hr < 17) return { label: "Work", color: "bg-green-500", border: "border-green-600" };
    if (hr >= 22 || hr < 6) return { label: "Sleep", color: "bg-destructive/60", border: "border-destructive" };
    return { label: "Personal", color: "bg-yellow-500", border: "border-yellow-600" };
  };

  const copyMeetingSchedule = () => {
    let summary = `Global Meeting Schedule (${selectedDate}):\n`;
    selectedCities.forEach((city) => {
      summary += `- ${city.name}: ${getConvertedTimeStr(city.zone)}\n`;
    });
    
    navigator.clipboard.writeText(summary);
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
            <Clock className="h-8 w-8 text-primary" />
            Time Zone Converter
          </h1>
          <p className="text-sm text-muted-foreground">
            Coordinate times across multiple cities, view offsets, and plan global meetings.
          </p>
        </div>
      </div>

      {/* Live Clocks Bar */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
          <Globe className="h-4.5 w-4.5 text-primary" />
          Live Clocks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {liveTime && selectedCities.map((city) => (
            <div key={city.zone} className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between">
              <span className="text-xs font-bold truncate">{city.name}</span>
              <span className="text-xl font-extrabold font-mono text-primary mt-2">
                {liveTime.toLocaleTimeString("en-US", { timeZone: city.zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </span>
              <span className="text-[9px] text-muted-foreground mt-1 truncate">
                {liveTime.toLocaleDateString("en-US", { timeZone: city.zone, weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Main meeting planner workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left planner pane */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-primary" />
                Meeting Planner
              </h2>
              
              {/* Selector configurations */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs bg-background font-semibold"
                />
                <button
                  onClick={copyMeetingSchedule}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground border border-border transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Schedule"}</span>
                </button>
              </div>
            </div>

            {/* Slider bar */}
            <div className="space-y-2.5 bg-secondary/30 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>Drag local time slider:</span>
                <span className="text-primary text-sm font-mono bg-background border border-border px-2.5 py-0.5 rounded-lg">
                  {selectedHour === 0 ? "12:00 AM" : selectedHour === 12 ? "12:00 PM" : selectedHour > 12 ? `${selectedHour - 12}:00 PM` : `${selectedHour}:00 AM`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Timelines grid list */}
            <div className="space-y-6">
              {selectedCities.map((city) => {
                const tzHour = getHourInTimezone(city.zone);
                const { label: zoneLabel, color: zoneColor } = getHourCategory(tzHour);

                return (
                  <div key={city.zone} className="space-y-2 border-b border-border last:border-none pb-4 last:pb-0">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{city.name}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold text-white ${zoneColor}`}>
                          {zoneLabel}
                        </span>
                      </div>
                      <span className="font-mono text-muted-foreground text-[11px]">
                        {getConvertedTimeStr(city.zone)}
                      </span>
                    </div>

                    {/* Timeline bar (24 individual slots) */}
                    <div className="grid grid-cols-24 gap-0.5 h-6 rounded-md overflow-hidden bg-secondary">
                      {Array.from({ length: 24 }).map((_, hIndex) => {
                        // We need to compute hour at this slot relative to source local selectedHour
                        const offsetDate = new Date();
                        // Find what time this index represents relative to source timezone
                        // For simplicity, find offset difference
                        const sourceDate = new Date();
                        sourceDate.setHours(hIndex);
                        
                        const timeParts = new Intl.DateTimeFormat("en-US", {
                          timeZone: city.zone,
                          hour: "numeric",
                          hour12: false
                        }).formatToParts(sourceDate);

                        const slotHour = parseInt(timeParts.find(p => p.type === "hour")?.value || "0");
                        const cat = getHourCategory(slotHour);
                        
                        // Check if this slot matches current converted time hour
                        const isCurrent = slotHour === tzHour;

                        return (
                          <div
                            key={hIndex}
                            className={`h-full ${cat.color} transition-all relative group cursor-pointer border-r border-background/20 last:border-none`}
                            onClick={() => {
                              // Calculate reverse mapping to set selectedHour
                              // Set local slider relative to this city's chosen slot
                              // Simplest: just align local hour index
                              setSelectedHour(hIndex);
                            }}
                            title={`${hIndex}:00 (${cat.label})`}
                          >
                            {isCurrent && (
                              <div className="absolute inset-0 bg-primary/40 border-2 border-primary z-10" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helper explanation blocks */}
            <div className="flex justify-start gap-6 pt-2 text-[10px] text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>Working hours (9 AM - 5 PM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-yellow-500" />
                <span>Personal hours (6 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-destructive/60" />
                <span>Sleeping hours (10 PM - 6 AM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Add Cities pane */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b border-border pb-2">Manage Timezones</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Select City</label>
                <div className="flex gap-2">
                  <select
                    value={cityToAdd}
                    onChange={(e) => setCityToAdd(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border text-xs bg-background text-foreground font-semibold"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.zone} value={c.zone}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addCity}
                    className="p-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition-colors"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Added timezones list with trash button */}
              <div className="space-y-2 border-t border-border pt-3">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active timezones</span>
                <div className="space-y-1.5">
                  {selectedCities.map((city) => (
                    <div key={city.zone} className="flex justify-between items-center p-2 rounded-lg border border-border bg-background text-xs font-semibold">
                      <span className="truncate max-w-[160px]">{city.name}</span>
                      <button
                        onClick={() => removeCity(city.zone)}
                        className="p-1 hover:bg-secondary rounded text-destructive hover:text-destructive/80 transition-colors ml-2"
                        title="Remove timezone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">Time Zone Converter FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">How does the meeting planner identify working hours?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Working hours are mapped statically as 9:00 AM to 5:00 PM in each respective local timezone. Highlighting these zones in green allows you to easily find slots where the working hours of multiple cities overlap.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Does the tool adjust for Daylight Saving Time (DST)?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Yes. The planner queries JavaScript&apos;s native `Intl.DateTimeFormat` engine, which contains comprehensive up-to-date IANA timezone databases that automatically adjust for daylight saving transitions depending on your chosen calendar date.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/unit-converter"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Unit Converter</h4>
              <p className="text-xs text-muted-foreground mt-1">Convert storage capacities, weights, speeds and temperatures.</p>
            </div>
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/age-calculator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Age Calculator</h4>
              <p className="text-xs text-muted-foreground mt-1">Check years, months, and countdowns to birthdays.</p>
            </div>
            <Clock className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
