import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent hijacking of the default Admin email
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || "anishkumarbiswas2003@gmail.com").toLowerCase();
    if (normalizedEmail === defaultAdminEmail) {
      return NextResponse.json({ error: "This email address is reserved." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    }).catch(() => null);

    if (existingUser) {
      return NextResponse.json({ error: "Email address is already registered" }, { status: 400 });
    }

    // Create the user (plain text password as currently defined in authOptions credentials check)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: "USER"
      }
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    console.error("Register API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
