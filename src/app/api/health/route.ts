import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Record health check entry
    const healthEntry = await db.systemHealth.create({
      data: {
        status: "OK",
        checkedAt: new Date(),
      },
    });

    const totalHealthChecks = await db.systemHealth.count();
    const userCount = await db.user.count();

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      database: "postgresql://217.216.59.176:5432/northeastconnect",
      stats: {
        totalHealthChecks,
        userCount,
        latestCheck: healthEntry,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
