import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { awardUserXp } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const q = searchParams.get("q");
    const condition = searchParams.get("condition");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: "Active",
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (state && state !== "All States") {
      where.state = state;
    }

    if (city && city.trim()) {
      where.city = { contains: city.trim(), mode: "insensitive" };
    }

    if (condition && condition !== "All") {
      where.condition = condition;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
        { locality: { contains: q.trim(), mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "popular") orderBy = { viewsCount: "desc" };

    const [items, total] = await Promise.all([
      db.marketplaceListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImageUrl: true,
              rankTier: true,
              xpPoints: true,
            },
          },
        },
      }),
      db.marketplaceListing.count({ where }),
    ]);

    return NextResponse.json({
      status: "success",
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Marketplace GET error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to post an ad" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      isNegotiable,
      category,
      condition,
      state,
      city,
      locality,
      imageUrls,
      contactPhone,
      contactWhatsApp,
      contactEmail,
    } = body;

    if (!title || !description || price === undefined || !category || !state || !city) {
      return NextResponse.json(
        { status: "error", message: "Title, description, price, category, state, and city are required." },
        { status: 400 }
      );
    }

    const listing = await db.marketplaceListing.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : true,
        category: category.trim(),
        condition: condition || "Good",
        state: state.trim(),
        city: city.trim(),
        locality: locality?.trim() || null,
        imageUrls: imageUrls?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactWhatsApp: contactWhatsApp?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
          },
        },
      },
    });

    // Award +30 XP for posting a marketplace ad
    await awardUserXp(
      user.id,
      "POST",
      30,
      `Posted Marketplace Ad: ${listing.title}`,
      listing.id
    );

    return NextResponse.json({
      status: "success",
      message: "Ad posted successfully! +30 XP awarded.",
      listing,
    });
  } catch (error: any) {
    console.error("Marketplace POST error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
