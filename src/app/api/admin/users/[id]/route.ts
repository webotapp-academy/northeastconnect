import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankFromXp } from "@/lib/gamification";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.role !== undefined) dataToUpdate.role = body.role;
    if (body.xpPoints !== undefined) {
      dataToUpdate.xpPoints = parseInt(body.xpPoints, 10);
      const rank = getRankFromXp(dataToUpdate.xpPoints);
      dataToUpdate.rankTier = rank.tier;
    }

    const updated = await db.user.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    return NextResponse.json({ status: "success", item: updated });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
