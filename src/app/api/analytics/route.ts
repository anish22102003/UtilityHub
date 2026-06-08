import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { toolName } = await request.json();
    if (!toolName) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
    }

    const log = await prisma.toolUsage.create({
      data: { toolName }
    }).catch(() => null);

    return NextResponse.json({ success: true, log });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
