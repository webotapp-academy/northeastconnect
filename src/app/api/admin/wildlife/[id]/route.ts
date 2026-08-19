import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const item = await db.wildlife.findUnique({ where: { id: numericId } });
    if (!item) {
      return NextResponse.json({ status: "error", message: "Wildlife item not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", item });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const body = await request.json();

    const updated = await db.wildlife.update({
      where: { id: numericId },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        district: body.district,
        bestSeason: body.bestSeason,
        animalSpecies: body.animalSpecies,
        entryFee: body.entryFee ? parseFloat(body.entryFee) : null,
        openingHours: body.timings,
        imageUrls: body.imageUrls,
        status: body.status,
      },
    });

    return NextResponse.json({ status: "success", item: updated });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    await db.wildlife.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Wildlife sanctuary deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
