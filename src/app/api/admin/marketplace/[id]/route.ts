import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const body = await request.json();

    const updated = await db.marketplaceListing.update({
      where: { id: numericId },
      data: {
        status: body.status,
        featured: body.featured !== undefined ? body.featured : (body.isFeatured !== undefined ? body.isFeatured : undefined),
        title: body.title,
        price: body.price ? parseFloat(body.price) : undefined,
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
    await db.marketplaceListing.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Ad listing deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
