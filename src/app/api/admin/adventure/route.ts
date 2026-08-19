import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      db.adventure.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      db.adventure.count({ where }),
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
    const { name, type, description, location, district, difficultyLevel, duration, price, bestSeason, imageUrls, status } = body;

    if (!name) {
      return NextResponse.json({ status: "error", message: "Name is required" }, { status: 400 });
    }

    const created = await db.adventure.create({
      data: {
        name,
        type: type || "Trekking",
        description: description || null,
        location: location || null,
        district: district || null,
        difficultyLevel: difficultyLevel || null,
        duration: duration || null,
        price: price ? parseFloat(price) : null,
        bestSeason: bestSeason || null,
        imageUrls: imageUrls || null,
        status: status || "Available",
      },
    });

    return NextResponse.json({ status: "success", item: created });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
