import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const district = searchParams.get("district") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (district) where.district = district;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      db.directory.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      db.directory.count({ where }),
    ]);

    return NextResponse.json({
      status: "success",
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Admin Directory GET error:", error);
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, category, description, address, district, city, contactNumber, email, website, workingHours, imageUrls, status } = body;

    if (!businessName) {
      return NextResponse.json({ status: "error", message: "Business Name is required" }, { status: 400 });
    }

    const created = await db.directory.create({
      data: {
        businessName,
        category: category || "Other",
        description: description || null,
        address: address || null,
        district: district || null,
        city: city || null,
        contactNumber: contactNumber || null,
        email: email || null,
        website: website || null,
        workingHours: workingHours || null,
        imageUrls: imageUrls || null,
        status: status || "Active",
      },
    });

    return NextResponse.json({ status: "success", item: created });
  } catch (error: any) {
    console.error("Admin Directory POST error:", error);
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
