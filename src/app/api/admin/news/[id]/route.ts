import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadRemoteImageToR2 } from "@/lib/storage";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const numericId = parseInt(id, 10);
    const item = await db.news.findUnique({ where: { id: numericId } });
    if (!item) {
      return NextResponse.json({ status: "error", message: "News not found" }, { status: 404 });
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

    let processedImageUrls = body.imageUrls || null;
    if (body.imageUrls && typeof body.imageUrls === "string") {
      const urlList = body.imageUrls.split(",").map((u: string) => u.trim()).filter(Boolean);
      const uploadedList = await Promise.all(
        urlList.map((u: string) => uploadRemoteImageToR2(u, { folder: "news" }))
      );
      processedImageUrls = uploadedList.join(",");
    }

    const updated = await db.news.update({
      where: { id: numericId },
      data: {
        title: body.title,
        category: body.category,
        content: body.content,
        author: body.author,
        source: body.source,
        imageUrls: processedImageUrls,
        tags: body.tags,
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
    await db.news.delete({ where: { id: numericId } });
    return NextResponse.json({ status: "success", message: "Article deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
