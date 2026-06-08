import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    // Run queries in parallel
    const [
      totalUrls,
      totalClicks,
      totalUsers,
      recentUrls,
      toolUsages
    ] = await Promise.all([
      prisma.shortUrl.count().catch(() => 0),
      prisma.clickEvent.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.shortUrl.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          originalUrl: true,
          slug: true,
          clicks: true,
          createdAt: true
        }
      }).catch(() => []),
      prisma.toolUsage.groupBy({
        by: ["toolName"],
        _count: {
          _all: true
        },
        orderBy: {
          _count: {
            toolName: "desc"
          }
        }
      }).catch(() => [])
    ]);

    const formattedToolUsages = toolUsages.map((t) => ({
      name: t.toolName,
      count: t._count._all
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUrls,
        totalClicks,
        totalUsers,
        recentUrls,
        toolUsages: formattedToolUsages
      }
    });
  } catch (err: any) {
    console.error("Admin Stats API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
