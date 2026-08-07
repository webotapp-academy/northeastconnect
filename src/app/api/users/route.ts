import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ status: "success", users });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const username = email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);

    const newUser = await db.user.create({
      data: {
        username,
        email,
        fullName: name || null,
        passwordHash: "hash_placeholder",
        role: role || "User",
      },
    });

    return NextResponse.json({ status: "success", user: newUser });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
