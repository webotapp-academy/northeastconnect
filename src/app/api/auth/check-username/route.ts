import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = (searchParams.get("username") || "").trim();

    if (!username) {
      return NextResponse.json({
        available: false,
        message: "Username is required",
      });
    }

    if (username.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username must be at least 3 characters",
      });
    }

    if (username.length > 25) {
      return NextResponse.json({
        available: false,
        message: "Username cannot exceed 25 characters",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        message: "Only letters, numbers, and underscores allowed",
      });
    }

    const existingUser = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: `@${username} is already taken`,
      });
    }

    return NextResponse.json({
      available: true,
      message: `@${username} is available!`,
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json(
      { available: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
