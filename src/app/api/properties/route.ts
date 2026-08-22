import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const state = searchParams.get("state") || "All";
    const city = searchParams.get("city") || "All";
    const propertyType = searchParams.get("propertyType") || "All Types";
    const listingType = searchParams.get("listingType") || "All";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const sort = (searchParams.get("sort") || "views").toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "16", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: "Active",
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { locality: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ];
    }

    if (state && state !== "All" && state !== "All States") {
      where.state = { contains: state, mode: "insensitive" };
    }

    if (city && city !== "All" && city !== "All Cities") {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (propertyType && propertyType !== "All" && propertyType !== "All Types") {
      where.propertyType = { contains: propertyType, mode: "insensitive" };
    }

    if (listingType && listingType !== "All" && listingType !== "All Listings") {
      where.listingType = { contains: listingType, mode: "insensitive" };
    }

    if (bedrooms && bedrooms !== "All") {
      const bNum = parseInt(bedrooms, 10);
      if (!isNaN(bNum)) {
        where.bedrooms = bNum >= 5 ? { gte: 5 } : bNum;
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = [{ viewsCount: "desc" as const }, { createdAt: "desc" as const }];
    if (sort === "recent" || sort === "newest") {
      orderBy = [{ createdAt: "desc" as const }];
    } else if (sort === "price_asc") {
      orderBy = [{ price: "asc" as const }];
    } else if (sort === "price_desc") {
      orderBy = [{ price: "desc" as const }];
    }

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImageUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.property.count({ where }),
    ]);

    return NextResponse.json({
      status: "success",
      total,
      page,
      hasMore: skip + properties.length < total,
      data: properties,
    });
  } catch (error: any) {
    console.error("Fetch properties error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Authentication required to list a property" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      priceNegotiable,
      priceUnit,
      bedrooms,
      bathrooms,
      areaSqFt,
      facing,
      furnishing,
      state,
      city,
      locality,
      address,
      pincode,
      imageUrls,
      amenities,
      postedBy,
      contactName,
      contactPhone,
      contactEmail,
      contactWhatsApp,
    } = body;

    if (!title || !propertyType || !listingType || !price || !state || !city) {
      return NextResponse.json(
        { status: "error", message: "Title, property type, listing type, price, state, and city are required." },
        { status: 400 }
      );
    }

    const property = await db.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        propertyType: propertyType.trim(),
        listingType: listingType.trim(),
        price: parseFloat(price) || 0,
        priceNegotiable: Boolean(priceNegotiable),
        priceUnit: priceUnit || "total",
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
        areaSqFt: areaSqFt ? parseFloat(areaSqFt) : null,
        facing: facing?.trim() || null,
        furnishing: furnishing || "Unfurnished",
        state: state.trim(),
        city: city.trim(),
        locality: locality?.trim() || null,
        address: address?.trim() || null,
        pincode: pincode?.trim() || null,
        imageUrls: Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : (typeof imageUrls === "string" ? imageUrls : null),
        amenities: Array.isArray(amenities) ? amenities.join(", ") : (amenities || null),
        postedBy: postedBy || "Owner",
        contactName: contactName?.trim() || user.fullName || user.username || null,
        contactPhone: contactPhone?.trim() || null,
        contactEmail: contactEmail?.trim() || user.email || null,
        contactWhatsApp: contactWhatsApp?.trim() || null,
        userId: user.id,
        status: "Active",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Property listing created successfully!",
      data: property,
    });
  } catch (error: any) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to create property listing" },
      { status: 500 }
    );
  }
}
