"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  ArrowLeft,
  Link as LinkIcon, 
  Mail, 
  Wifi, 
  Phone, 
  Type, 
  Check, 
  RotateCcw,
  ScanQrCode
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

export default function QRGenerator() {
  const [qrType, setQrType] = React.useState<"text" | "url" | "email" | "wifi" | "phone">("url");
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("https://");
  
  // Email fields
  const [emailTo, setEmailTo] = React.useState("");
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");

  // WiFi fields
  const [wifiSsid, setWifiSsid] = React.useState("");
  const [wifiPassword, setWifiPassword] = React.useState("");
  const [wifiEncryption, setWifiEncryption] = React.useState("WPA");
  const [wifiHidden, setWifiHidden] = React.useState(false);

  // Phone fields
  const [phone, setPhone] = React.useState("");

  // Design config
  const [fgColor, setFgColor] = React.useState("#000000");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [margin, setMargin] = React.useState(4);

  const [qrPngUrl, setQrPngUrl] = React.useState("");
  const [qrSvgString, setQrSvgString] = React.useState("");
  
  const [copied, setCopied] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    logToolUsage("QR Code Generator");
  }, []);

  const getQRData = React.useCallback(() => {
    switch (qrType) {
      case "url":
        return url;
      case "email":
        const emailParams = [];
        if (emailSubject) emailParams.push(`subject=${encodeURIComponent(emailSubject)}`);
        if (emailBody) emailParams.push(`body=${encodeURIComponent(emailBody)}`);
        const query = emailParams.length ? `?${emailParams.join("&")}` : "";
        return `mailto:${emailTo}${query}`;
      case "wifi":
        // Format: WIFI:S:SSID;T:WPA;P:PASSWORD;H:true;;
        const hiddenPart = wifiHidden ? "H:true;" : "";
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};${hiddenPart};`;
      case "phone":
        return `tel:${phone}`;
      case "text":
      default:
        return text || "UtilityHub QR Code";
    }
  }, [qrType, url, emailTo, emailSubject, emailBody, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, phone, text]);

  const generateQRCode = React.useCallback(async () => {
    const data = getQRData();
    if (!data) return;

    try {
      const opts = {
        color: {
          dark: fgColor,
          light: bgColor,
        },
        margin: Number(margin),
        width: 512,
      };

      const png = await QRCode.toDataURL(data, opts);
      setQrPngUrl(png);

      const svg = await QRCode.toString(data, { ...opts, type: "svg" });
      setQrSvgString(svg);
    } catch (err) {
      console.error(err);
    }
  }, [getQRData, fgColor, bgColor, margin]);

  React.useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const downloadPNG = () => {
    if (!qrPngUrl) return;
    const a = document.createElement("a");
    a.href = qrPngUrl;
    a.download = `qr-code-${qrType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSVG = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `qr-code-${qrType}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "UtilityHub QR Code Generator",
          text: "Check out this handy QR code generator tool!",
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        copyPageLink();
      }
    } else {
      copyPageLink();
    }
  };

  const resetConfig = () => {
    setFgColor("#000000");
    setBgColor("#ffffff");
    setMargin(4);
    setText("");
    setUrl("https://");
    setEmailTo("");
    setEmailSubject("");
    setEmailBody("");
    setWifiSsid("");
    setWifiPassword("");
    setWifiEncryption("WPA");
    setWifiHidden(false);
    setPhone("");
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
            <QrCode className="h-8 w-8 text-primary" />
            QR Code Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate high-resolution QR codes offline with customizable themes and vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Input types list */}
            <div className="grid grid-cols-5 gap-2 border-b border-border pb-4 overflow-x-auto">
              {[
                { id: "url", label: "URL", icon: LinkIcon },
                { id: "text", label: "Text", icon: Type },
                { id: "email", label: "Email", icon: Mail },
                { id: "wifi", label: "WiFi", icon: Wifi },
                { id: "phone", label: "Phone", icon: Phone },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setQrType(tab.id as any)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      qrType === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub fields dependent on selected tab */}
            <div className="space-y-4 min-h-[160px]">
              {qrType === "url" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold">Destination URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {qrType === "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold">Custom Text</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter plain text, message, or notes..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              )}

              {qrType === "email" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold">Email Address</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="hello@utilityhub.com"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold">Subject (Optional)</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Feedback"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold">Body (Optional)</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email body here..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {qrType === "wifi" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Network Name (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="HomeWiFi"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Password</label>
                      <input
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold block">Encryption</label>
                      <span className="text-[10px] text-muted-foreground">Select Wi-Fi protocol type</span>
                    </div>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value)}
                      className="px-2 py-1 rounded border border-border text-xs bg-background"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Unsecured (None)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold block">Hidden Network</label>
                      <span className="text-[10px] text-muted-foreground">Check if SSID is invisible</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded border-border text-primary h-4 w-4"
                    />
                  </div>
                </div>
              )}

              {qrType === "phone" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Design Customizations */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base border-b border-border pb-2">Customize Appearance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{fgColor.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{bgColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Quiet Zone (Margin)</span>
                <span>{margin}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="font-bold text-lg text-foreground">QR Code Preview</h3>
            
            {/* Live QR Output wrapper */}
            <div 
              className="p-6 rounded-2xl border border-border bg-white shadow-inner flex items-center justify-center w-full max-w-[280px] aspect-square transition-all"
              style={{ backgroundColor: bgColor }}
            >
              {qrPngUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrPngUrl}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-muted-foreground">Enter values to generate...</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={downloadPNG}
                disabled={!qrPngUrl}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                PNG Export
              </button>
              <button
                onClick={downloadSVG}
                disabled={!qrSvgString}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground font-semibold text-xs text-foreground transition-all border border-border disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                SVG Export
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-border">
              <button
                onClick={shareResult}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                {shared ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{shared ? "Shared!" : "Share Link"}</span>
              </button>
              <button
                onClick={resetConfig}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">QR Code Generator FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">What information can be encoded in a QR Code?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              QR codes can store various forms of alphanumeric data including websites, contact cards, WiFi keys, plain text messages, and email credentials. 
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Do these generated QR codes expire?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              No. The generated codes are static QR codes containing literal configurations (e.g. WiFi networks or raw URLs). They will function indefinitely as long as the destination URL or WiFi network password does not change.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/qr-scanner"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">QR Code Scanner</h4>
              <p className="text-xs text-muted-foreground mt-1">Scan codes on webcam or uploads.</p>
            </div>
            <ScanQrCode className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/url-shortener"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">URL Shortener</h4>
              <p className="text-xs text-muted-foreground mt-1">Shorten links and log clicks.</p>
            </div>
            <LinkIcon className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
