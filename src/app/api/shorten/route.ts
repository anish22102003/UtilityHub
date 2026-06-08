import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RESERVED_SLUGS = ["tools", "admin", "api", "login", "sitemap", "robots", "manifest"];

function generateRandomSlug(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function POST(request: Request) {
  try {
    const { originalUrl, customSlug } = await request.json();

    if (!originalUrl) {
      return NextResponse.json({ error: "Original URL is required" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch (_) {
      return NextResponse.json({ error: "Invalid URL format. Please include http:// or https://" }, { status: 400 });
    }

    let slug = customSlug?.trim();

    if (slug) {
      // Validate slug format
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return NextResponse.json({ error: "Custom slug can only contain letters, numbers, hyphens, and underscores." }, { status: 400 });
      }

      if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
        return NextResponse.json({ error: "This slug is reserved and cannot be used." }, { status: 400 });
      }

      // Check collision
      const existing = await prisma.shortUrl.findUnique({
        where: { slug }
      }).catch(() => null);

      if (existing) {
        return NextResponse.json({ error: "Custom slug is already in use. Please try another." }, { status: 400 });
      }
    } else {
      // Generate a non-colliding slug
      let attempts = 0;
      while (attempts < 5) {
        slug = generateRandomSlug();
        const existing = await prisma.shortUrl.findUnique({
          where: { slug }
        }).catch(() => null);
        if (!existing) break;
        attempts++;
      }
      if (attempts >= 5) {
        return NextResponse.json({ error: "Failed to generate unique slug. Please try again." }, { status: 500 });
      }
    }

    // Get current session if user is logged in
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user ? (session.user as any).id : null;

    const shortUrlRecord = await prisma.shortUrl.create({
      data: {
        originalUrl,
        slug,
        userId
      }
    });

    return NextResponse.json({
      success: true,
      shortUrl: shortUrlRecord
    });
  } catch (err: any) {
    console.error("Shorten API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
