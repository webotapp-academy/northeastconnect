import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const item = await db.directory.findUnique({ where: { id: numericId } });
    if (!item) {
      return NextResponse.json({ status: "error", message: "Listing not found" }, { status: 404 });
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

    const updated = await db.directory.update({
      where: { id: numericId },
      data: {
        businessName: body.businessName,
        category: body.category,
        description: body.description,
        address: body.address,
        district: body.district,
        city: body.city,
        contactNumber: body.contactNumber,
        email: body.email,
        website: body.website,
        workingHours: body.workingHours,
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
    await db.directory.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Listing deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
