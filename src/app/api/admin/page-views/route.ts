import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const views = await db.pageView.findMany({
      orderBy: { views: "desc" },
    });
    return NextResponse.json({ status: "success", items: views });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
