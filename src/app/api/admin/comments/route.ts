import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      where.NOT = { status: "Deleted" };
    }
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const [comments, total] = await Promise.all([
      db.universalComment.findMany({
        where,
        orderBy: { id: "desc" },
        include: {
          user: {
            select: { id: true, username: true, fullName: true, email: true },
          },
        },
        skip,
        take: limit,
      }),
      db.universalComment.count({ where }),
    ]);

    return NextResponse.json({
      status: "success",
      items: comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
