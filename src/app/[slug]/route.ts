import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Lookup URL
    const record = await prisma.shortUrl.findUnique({
      where: { slug },
      include: { clickEvents: true }
    }).catch(() => null);

    if (!record) {
      // If slug not found, redirect to home page or show 404
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Increment click counts asynchronously or synchronously
    await prisma.shortUrl.update({
      where: { id: record.id },
      data: { clicks: { increment: 1 } }
    }).catch(() => null);

    // Extract headers for analytics
    const headers = request.headers;
    const userAgent = headers.get("user-agent") || "";
    const referrer = headers.get("referer") || "Direct";

    // Simple parser for OS
    let os = "Unknown";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/linux/i.test(userAgent)) os = "Linux";

    // Simple parser for Browser
    let browser = "Unknown";
    if (/edg/i.test(userAgent)) browser = "Edge";
    else if (/opr|opera/i.test(userAgent)) browser = "Opera";
    else if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent)) browser = "Safari";

    // Simple device detector
    let device = "Desktop";
    if (/ipad/i.test(userAgent)) device = "Tablet";
    else if (/mobi/i.test(userAgent) || /iphone|ipod|android/i.test(userAgent)) device = "Mobile";

    // Create click record
    await prisma.clickEvent.create({
      data: {
        shortUrlId: record.id,
        referrer: referrer.substring(0, 255),
        browser,
        os,
        device,
        country: "Unknown" // Can expand if GeoIP headers are present
      }
    }).catch(() => null);

    // Redirect to the original URL
    return NextResponse.redirect(new URL(record.originalUrl), 307);
  } catch (err) {
    console.error("Redirect Error:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
