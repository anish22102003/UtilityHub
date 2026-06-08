"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ArrowLeftRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles,
  Scale,
  Ruler,
  Thermometer,
  Grid,
  FileCode,
  Zap,
  Globe
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

type CategoryType = "length" | "weight" | "temperature" | "area" | "volume" | "speed" | "dataStorage";

interface Unit {
  value: string;
  label: string;
  factor?: number; // Multiply by this to get base unit
}

const categoriesData: Record<CategoryType, { label: string; base: string; icon: any; units: Unit[] }> = {
  length: {
    label: "Length",
    base: "m",
    icon: Ruler,
    units: [
      { value: "m", label: "Meters (m)", factor: 1 },
      { value: "km", label: "Kilometers (km)", factor: 1000 },
      { value: "cm", label: "Centimeters (cm)", factor: 0.01 },
      { value: "mm", label: "Millimeters (mm)", factor: 0.001 },
      { value: "mile", label: "Miles (mi)", factor: 1609.344 },
      { value: "yard", label: "Yards (yd)", factor: 0.9144 },
      { value: "foot", label: "Feet (ft)", factor: 0.3048 },
      { value: "inch", label: "Inches (in)", factor: 0.0254 }
    ]
  },
  weight: {
    label: "Weight",
    base: "g",
    icon: Scale,
    units: [
      { value: "g", label: "Grams (g)", factor: 1 },
      { value: "kg", label: "Kilograms (kg)", factor: 1000 },
      { value: "mg", label: "Milligrams (mg)", factor: 0.001 },
      { value: "lb", label: "Pounds (lbs)", factor: 453.59237 },
      { value: "oz", label: "Ounces (oz)", factor: 28.34952 },
      { value: "stone", label: "Stones (st)", factor: 6350.293 }
    ]
  },
  temperature: {
    label: "Temperature",
    base: "C",
    icon: Thermometer,
    units: [
      { value: "C", label: "Celsius (°C)" },
      { value: "F", label: "Fahrenheit (°F)" },
      { value: "K", label: "Kelvin (K)" }
    ]
  },
  area: {
    label: "Area",
    base: "m2",
    icon: Grid,
    units: [
      { value: "m2", label: "Square Meters (m²)", factor: 1 },
      { value: "km2", label: "Square Kilometers (km²)", factor: 1_000_000 },
      { value: "mile2", label: "Square Miles (mi²)", factor: 2_589_988.11 },
      { value: "acre", label: "Acres (ac)", factor: 4046.85642 },
      { value: "hectare", label: "Hectares (ha)", factor: 10000 },
      { value: "ft2", label: "Square Feet (ft²)", factor: 0.092903 }
    ]
  },
  volume: {
    label: "Volume",
    base: "L",
    icon: Zap, // Custom volume symbol helper
    units: [
      { value: "L", label: "Liters (L)", factor: 1 },
      { value: "ml", label: "Milliliters (ml)", factor: 0.001 },
      { value: "gal", label: "Gallons (gal)", factor: 3.78541 },
      { value: "qt", label: "Quarts (qt)", factor: 0.946353 },
      { value: "pt", label: "Pints (pt)", factor: 0.473176 },
      { value: "cup", label: "Cups (cup)", factor: 0.236588 }
    ]
  },
  speed: {
    label: "Speed",
    base: "m/s",
    icon: ArrowLeftRight,
    units: [
      { value: "m/s", label: "Meters/Second (m/s)", factor: 1 },
      { value: "km/h", label: "Kilometers/Hour (km/h)", factor: 0.277778 },
      { value: "mph", label: "Miles/Hour (mph)", factor: 0.44704 },
      { value: "knot", label: "Knots (kn)", factor: 0.514444 }
    ]
  },
  dataStorage: {
    label: "Data Storage",
    base: "B",
    icon: FileCode,
    units: [
      { value: "B", label: "Bytes (B)", factor: 1 },
      { value: "KB", label: "Kilobytes (KB)", factor: 1024 },
      { value: "MB", label: "Megabytes (MB)", factor: 1024 * 1024 },
      { value: "GB", label: "Gigabytes (GB)", factor: 1024 * 1024 * 1024 },
      { value: "TB", label: "Terabytes (TB)", factor: 1024 * 1024 * 1024 * 1024 },
      { value: "PB", label: "Petabytes (PB)", factor: 1024 * 1024 * 1024 * 1024 * 1024 }
    ]
  }
};

export default function UnitConverter() {
  const [category, setCategory] = React.useState<CategoryType>("length");
  
  const [fromUnit, setFromUnit] = React.useState("m");
  const [toUnit, setToUnit] = React.useState("km");
  
  const [fromVal, setFromVal] = React.useState("1");
  const [toVal, setToVal] = React.useState("0.001");
  
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("Unit Converter");
  }, []);

  // Update default units on category change
  React.useEffect(() => {
    const units = categoriesData[category].units;
    setFromUnit(units[0].value);
    setToUnit(units[1]?.value || units[0].value);
    setFromVal("1");
  }, [category]);

  const handleConvert = React.useCallback((val: string, source: "from" | "to", currentFrom = fromUnit, currentTo = toUnit) => {
    if (category === "temperature") {
      const numeric = parseFloat(val);
      if (isNaN(numeric)) {
        if (source === "from") setToVal("");
        else setFromVal("");
        return;
      }

      const convertTemp = (v: number, from: string, to: string): number => {
        let celsius = v;
        if (from === "F") celsius = (v - 32) * (5 / 9);
        else if (from === "K") celsius = v - 273.15;

        if (to === "C") return celsius;
        if (to === "F") return celsius * (9 / 5) + 32;
        if (to === "K") return celsius + 273.15;
        return v;
      };

      if (source === "from") {
        const res = convertTemp(numeric, currentFrom, currentTo);
        setToVal(res.toFixed(4).replace(/\.?0+$/, ""));
      } else {
        const res = convertTemp(numeric, currentTo, currentFrom);
        setFromVal(res.toFixed(4).replace(/\.?0+$/, ""));
      }
    } else {
      // General factor conversion
      const fromObj = categoriesData[category].units.find((u) => u.value === currentFrom);
      const toObj = categoriesData[category].units.find((u) => u.value === currentTo);

      if (!fromObj?.factor || !toObj?.factor) return;

      const numeric = parseFloat(val);
      if (isNaN(numeric)) {
        if (source === "from") setToVal("");
        else setFromVal("");
        return;
      }

      if (source === "from") {
        // From unit -> Base -> To unit
        const baseVal = numeric * fromObj.factor;
        const targetVal = baseVal / toObj.factor;
        setToVal(targetVal.toFixed(6).replace(/\.?0+$/, ""));
      } else {
        // To unit -> Base -> From unit
        const baseVal = numeric * toObj.factor;
        const targetVal = baseVal / fromObj.factor;
        setFromVal(targetVal.toFixed(6).replace(/\.?0+$/, ""));
      }
    }
  }, [category, fromUnit, toUnit]);

  // Sync conversions on unit selection changes
  React.useEffect(() => {
    handleConvert(fromVal, "from");
  }, [fromUnit, toUnit, fromVal, handleConvert]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromVal(toVal);
    setToVal(fromVal);
  };

  const copyResult = () => {
    const text = `${fromVal} ${fromUnit} = ${toVal} ${toUnit}`;
    navigator.clipboard.writeText(text);
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
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            Unit Converter
          </h1>
          <p className="text-sm text-muted-foreground">
            Quickly convert metrics across length, weight, data storage, speed, and other units offline.
          </p>
        </div>
      </div>

      {/* Main Categories Navigation Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 border-b border-border pb-4 overflow-x-auto">
        {(Object.keys(categoriesData) as CategoryType[]).map((catKey) => {
          const cat = categoriesData[catKey];
          const Icon = cat.icon;
          return (
            <button
              key={catKey}
              onClick={() => setCategory(catKey)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all ${
                category === catKey
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Converter Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-5 w-5 text-primary" />
                {categoriesData[category].label} Conversion
              </h3>
              <button
                onClick={swapUnits}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground border border-border transition-colors"
              >
                Swap Units
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
              {/* Column From */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => {
                    setFromUnit(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold"
                >
                  {categoriesData[category].units.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromVal}
                  onChange={(e) => {
                    setFromVal(e.target.value);
                    handleConvert(e.target.value, "from");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              {/* Column To */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => {
                    setToUnit(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold"
                >
                  {categoriesData[category].units.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={toVal}
                  onChange={(e) => {
                    setToVal(e.target.value);
                    handleConvert(e.target.value, "to");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick Result Copy box */}
            {fromVal && toVal && (
              <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold truncate leading-relaxed">
                  <span className="text-muted-foreground">{fromVal} {fromUnit} = </span>
                  <span className="text-primary font-bold">{toVal} {toUnit}</span>
                </div>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors border border-border"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Result"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b border-border pb-2">Category Specs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our {categoriesData[category].label} converter supports high-precision floating point conversions. 
              {category === "dataStorage" && " Calculations use base-2 bytes increments (1024 Bytes = 1 KB)."}
              {category === "temperature" && " Formula offsets are applied directly instead of base multiplier factors."}
            </p>
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground block uppercase">Supported units</span>
              <div className="flex flex-wrap gap-1">
                {categoriesData[category].units.map((u) => (
                  <span key={u.value} className="text-[9px] font-semibold font-mono bg-secondary px-2 py-0.5 rounded">
                    {u.value.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">Unit Converter FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Why does data storage use 1024 instead of 1000?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Data storage capacity is measured in binary values (powers of 2), where 1 Kilobyte is defined as $2^{10} = 1024$ Bytes. Our calculator uses these binary factors to match standard operating system disk capacity reporting.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Can I request additional unit support?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              We frequently expand our conversions list. You can contact an administrator or suggest adjustments in the feedback modules.
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
              <p className="text-xs text-muted-foreground mt-1">Convert hours and coordinate conference clocks.</p>
            </div>
            <Globe className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/age-calculator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Age Calculator</h4>
              <p className="text-xs text-muted-foreground mt-1">Calculate duration down to days and seconds.</p>
            </div>
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
