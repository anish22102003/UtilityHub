"use client";

import * as React from "react";
import Link from "next/link";
import jsQR from "jsqr";
import { 
  ScanQrCode, 
  Upload, 
  Camera, 
  CameraOff, 
  Copy, 
  Check, 
  ArrowLeft, 
  QrCode, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import { logToolUsage } from "@/lib/analytics";

export default function QRScanner() {
  const [scanMethod, setScanMethod] = React.useState<"upload" | "camera">("upload");
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animationFrameId = React.useRef<number | null>(null);

  React.useEffect(() => {
    logToolUsage("QR Code Scanner");
    return () => {
      stopCamera();
    };
  }, []);

  const copyToClipboard = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. File Upload scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setErrorMsg("Could not create canvas context.");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanResult(code.data);
        } else {
          setErrorMsg("No QR Code detected in this image. Ensure the code is clear and well-lit.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 2. Real-time Camera scanning
  const startCamera = async () => {
    setErrorMsg(null);
    setScanResult(null);
    setIsScanning(true);

    try {
      const constraints = {
        video: { facingMode: "environment" } // Prefer back camera
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
        videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg("Camera access denied or unavailable. Please upload an image instead.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!isScanning && !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanResult(code.data);
          stopCamera();
          return; // Stop scanning once code is found
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  const switchTab = (tab: "upload" | "camera") => {
    stopCamera();
    setErrorMsg(null);
    setScanResult(null);
    setScanMethod(tab);
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
            <ScanQrCode className="h-8 w-8 text-primary" />
            QR Code Scanner
          </h1>
          <p className="text-sm text-muted-foreground">
            Instantly decode QR codes by uploading images or scanning live from your camera.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Scanner Window */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Scan method toggle */}
            <div className="grid grid-cols-2 gap-2 border-b border-border pb-4">
              <button
                onClick={() => switchTab("upload")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  scanMethod === "upload"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
              <button
                onClick={() => switchTab("camera")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  scanMethod === "camera"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-4 w-4" />
                Live Camera
              </button>
            </div>

            {/* Scanning area */}
            <div className="relative min-h-[300px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-background overflow-hidden p-6">
              {scanMethod === "upload" && (
                <div className="space-y-4 text-center w-full max-w-sm">
                  <div className="p-4 rounded-full bg-secondary text-primary w-fit mx-auto">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Upload QR Image</p>
                    <p className="text-xs text-muted-foreground">Supports PNG, JPG, JPEG, and WebP formats</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="qr-image-upload"
                  />
                  <label
                    htmlFor="qr-image-upload"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                  >
                    Browse Files
                  </label>
                </div>
              )}

              {scanMethod === "camera" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    className={`w-full max-h-[360px] rounded-xl object-cover bg-black ${isScanning ? "block" : "hidden"}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Red guide scanner box */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -translate-x-1 -translate-y-1" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary translate-x-1 -translate-y-1" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -translate-x-1 translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary translate-x-1 translate-y-1" />
                        {/* Animated laser line */}
                        <div className="w-full h-0.5 bg-primary/80 absolute top-1/2 left-0 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse" />
                      </div>
                    </div>
                  )}

                  {!isScanning && (
                    <div className="space-y-4 text-center">
                      <div className="p-4 rounded-full bg-secondary text-primary w-fit mx-auto">
                        <CameraOff className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-sm">Camera is inactive</p>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-sm"
                      >
                        Start Scanning
                      </button>
                    </div>
                  )}

                  {isScanning && (
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-4 px-4 py-2 rounded-lg bg-black/75 hover:bg-black/90 text-white font-semibold text-xs transition-colors z-10"
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-xs text-destructive font-semibold">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Result Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Scanned Output
              </h3>

              {scanResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-background text-sm break-all font-mono min-h-[120px] select-all leading-relaxed whitespace-pre-wrap">
                    {scanResult}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-colors shadow-sm"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Result"}</span>
                    </button>
                    {scanResult.startsWith("http") && (
                      <a
                        href={scanResult}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 font-semibold text-xs text-foreground transition-colors border border-border text-center"
                      >
                        Open Link
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground space-y-2">
                  <ScanQrCode className="h-8 w-8 animate-pulse text-muted-foreground/60" />
                  <p className="text-xs">No scan result available. Please upload a QR code image or scan using your device webcam.</p>
                </div>
              )}
            </div>

            {scanResult && (
              <button
                onClick={() => setScanResult(null)}
                className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Scan Another Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground">QR Scanner FAQs</h3>
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">Is my camera feed recorded?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Never. The camera scan is done completely in memory within your browser using HTML5 Canvas. No video stream, image frame, or parsed output is transmitted online.
            </p>
          </div>
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-sm">What should I do if the camera isn&apos;t working?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Ensure you have granted camera permissions in your web browser. If you are on desktop without a webcam, you can take a photo on your smartphone and upload the image file directly.
            </p>
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Related Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tools/qr-generator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">QR Code Generator</h4>
              <p className="text-xs text-muted-foreground mt-1">Make customizable QR codes.</p>
            </div>
            <QrCode className="h-5 w-5 text-primary" />
          </Link>
          <Link
            href="/tools/password-generator"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-sm">Password Generator</h4>
              <p className="text-xs text-muted-foreground mt-1">Generate strong security strings.</p>
            </div>
            <Copy className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </section>
    </div>
  );
}
