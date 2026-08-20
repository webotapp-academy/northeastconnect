import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adda = searchParams.get("adda"); // e.g. "n:guwahati"

    // If specific adda is requested, return real members from DB matching this adda
    if (adda) {
      const clean = adda.replace(/^n:/, "").toLowerCase();

      let whereClause: any = { status: "Active" };

      if (clean === "guwahati") {
        whereClause.city = "Guwahati";
      } else if (clean === "shillong") {
        whereClause.OR = [{ city: "Shillong" }, { state: "Meghalaya" }];
      } else if (clean === "kaziranga") {
        whereClause.OR = [{ city: "Golaghat" }, { city: "Nagaon" }, { city: "Tezpur" }];
      } else if (clean === "nagaland") {
        whereClause.state = "Nagaland";
      } else if (clean === "sikkim") {
        whereClause.state = "Sikkim";
      } else if (clean === "tawang") {
        whereClause.state = "Arunachal Pradesh";
      } else if (clean === "majuli") {
        whereClause.OR = [{ city: "Majuli" }, { city: "Jorhat" }];
      } else if (clean === "dzukou") {
        whereClause.state = "Nagaland";
      } else if (clean === "cherrapunji") {
        whereClause.state = "Meghalaya";
      } else if (clean === "food") {
        whereClause.OR = [
          { bio: { contains: "food", mode: "insensitive" } },
          { bio: { contains: "thali", mode: "insensitive" } },
          { state: "Assam" },
        ];
      } else if (clean === "travel") {
        whereClause.OR = [
          { bio: { contains: "travel", mode: "insensitive" } },
          { bio: { contains: "explorer", mode: "insensitive" } },
          { state: "Assam" },
        ];
      } else if (clean === "music") {
        whereClause.OR = [
          { bio: { contains: "music", mode: "insensitive" } },
          { bio: { contains: "dance", mode: "insensitive" } },
          { state: "Assam" },
        ];
      } else {
        whereClause.OR = [
          { city: { contains: clean, mode: "insensitive" } },
          { state: { contains: clean, mode: "insensitive" } },
        ];
      }

      const totalCount = await db.user.count({ where: whereClause });
      const members = await db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          fullName: true,
          profileImageUrl: true,
          rankTier: true,
          xpPoints: true,
          city: true,
          state: true,
        },
        take: 30,
        orderBy: { xpPoints: "desc" },
      });

      return NextResponse.json({
        status: "success",
        adda,
        totalMembers: totalCount,
        members,
      });
    }

    // Otherwise return actual real DB member counts for all major addas
    const addasStats = await Promise.all([
      db.user.count({ where: { city: "Guwahati" } }).then((c) => ({ name: "n:guwahati", count: c })),
      db.user.count({ where: { OR: [{ city: "Shillong" }, { state: "Meghalaya" }] } }).then((c) => ({ name: "n:shillong", count: c })),
      db.user.count({ where: { OR: [{ city: "Golaghat" }, { city: "Nagaon" }, { city: "Tezpur" }] } }).then((c) => ({ name: "n:kaziranga", count: c })),
      db.user.count({ where: { state: "Nagaland" } }).then((c) => ({ name: "n:nagaland", count: c })),
      db.user.count({ where: { state: "Sikkim" } }).then((c) => ({ name: "n:sikkim", count: c })),
      db.user.count({ where: { state: "Arunachal Pradesh" } }).then((c) => ({ name: "n:tawang", count: c })),
      db.user.count({ where: { OR: [{ city: "Majuli" }, { city: "Jorhat" }] } }).then((c) => ({ name: "n:majuli", count: c })),
      db.user.count({ where: { state: "Nagaland" } }).then((c) => ({ name: "n:dzukou", count: c })),
      db.user.count({ where: { state: "Meghalaya" } }).then((c) => ({ name: "n:cherrapunji", count: c })),
      db.user.count({ where: { OR: [{ bio: { contains: "food", mode: "insensitive" } }, { bio: { contains: "thali", mode: "insensitive" } }] } }).then((c) => ({ name: "n:food", count: c })),
      db.user.count({ where: { OR: [{ bio: { contains: "travel", mode: "insensitive" } }, { bio: { contains: "explorer", mode: "insensitive" } }] } }).then((c) => ({ name: "n:travel", count: c })),
      db.user.count({ where: { OR: [{ bio: { contains: "music", mode: "insensitive" } }, { bio: { contains: "dance", mode: "insensitive" } }] } }).then((c) => ({ name: "n:music", count: c })),
    ]);

    return NextResponse.json({
      status: "success",
      addas: addasStats,
    });
  } catch (error: any) {
    console.error("Addas API error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load Adda members" },
      { status: 500 }
    );
  }
}
