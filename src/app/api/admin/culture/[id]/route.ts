import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const item = await db.culture.findUnique({ where: { id: numericId } });
    if (!item) {
      return NextResponse.json({ status: "error", message: "Culture item not found" }, { status: 404 });
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

    const updated = await db.culture.update({
      where: { id: numericId },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        location: body.location,
        district: body.district,
        historicalSignificance: body.significance,
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
    await db.culture.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Culture item deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
