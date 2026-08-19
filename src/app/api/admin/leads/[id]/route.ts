import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const body = await request.json();

    const updated = await db.lead.update({
      where: { id: numericId },
      data: {
        status: body.status,
        notes: body.notes,
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
    await db.lead.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Lead deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
