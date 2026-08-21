import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ status: "success", suggestions: [] });
    }

    const [users, businesses, marketplace] = await Promise.all([
      db.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          profileImageUrl: true,
          state: true,
          city: true,
        },
        take: 3,
      }),
      db.directory.findMany({
        where: {
          status: "Active",
          OR: [
            { businessName: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          businessName: true,
          category: true,
          district: true,
          city: true,
          imageUrls: true,
        },
        take: 3,
      }),
      db.marketplaceListing.findMany({
        where: {
          status: "Active",
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          imageUrls: true,
        },
        take: 2,
      }),
    ]);

    const matchingAddas = MASTER_ADDAS.filter(
      (a) =>
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.title.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);

    const suggestions: any[] = [];

    users.forEach((u) => {
      suggestions.push({
        type: "users",
        label: u.fullName || u.username,
        subLabel: `@${u.username} • ${u.city || u.state || "Explorer"}`,
        icon: "👥",
        image:
          u.profileImageUrl ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`,
        tab: "users",
        query: u.username,
      });
    });

    matchingAddas.forEach((a) => {
      suggestions.push({
        type: "addas",
        label: a.name,
        subLabel: `${a.title} • Regional Hub`,
        icon: a.icon || "🏙️",
        image: null,
        tab: "addas",
        query: a.name,
      });
    });

    businesses.forEach((b) => {
      const firstImg = b.imageUrls ? b.imageUrls.split(",")[0].trim() : null;
      suggestions.push({
        type: "directory",
        label: b.businessName,
        subLabel: `${b.category || "Business"} • ${b.district || b.city || "Northeast"}`,
        icon: "🏪",
        image: firstImg,
        tab: "directory",
        query: b.businessName,
      });
    });

    marketplace.forEach((m) => {
      const firstImg = m.imageUrls ? m.imageUrls.split(",")[0].trim() : null;
      suggestions.push({
        type: "marketplace",
        label: m.title,
        subLabel: `₹${m.price.toLocaleString()} • ${m.category || "Item"}`,
        icon: "🛍️",
        image: firstImg,
        tab: "marketplace",
        query: m.title,
      });
    });

    return NextResponse.json({ status: "success", suggestions });
  } catch (error: any) {
    return NextResponse.json({ status: "error", suggestions: [] });
  }
}
