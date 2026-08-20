import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadRemoteImageToR2 } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      db.news.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      db.news.count({ where }),
    ]);

    return NextResponse.json({
      status: "success",
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, content, author, source, imageUrls, tags, status } = body;

    if (!title) {
      return NextResponse.json({ status: "error", message: "Title is required" }, { status: 400 });
    }

    // Process and upload images to R2 if remote URL provided
    let processedImageUrls = imageUrls || null;
    if (imageUrls && typeof imageUrls === "string") {
      const urlList = imageUrls.split(",").map((u: string) => u.trim()).filter(Boolean);
      const uploadedList = await Promise.all(
        urlList.map((u: string) => uploadRemoteImageToR2(u, { folder: "news" }))
      );
      processedImageUrls = uploadedList.join(",");
    }

    const created = await db.news.create({
      data: {
        title,
        category: category || "News",
        content: content || null,
        author: author || "Editor",
        source: source || null,
        imageUrls: processedImageUrls,
        tags: tags || null,
        status: status || "Published",
        publishedDate: new Date(),
      },
    });

    return NextResponse.json({ status: "success", item: created });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
