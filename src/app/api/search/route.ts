import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term")?.trim() || "";

  if (!term) {
    return NextResponse.json([]);
  }

  try {
    const [wildlife, adventure, culture, news, directory] = await Promise.all([
      db.wildlife.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      db.adventure.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      db.culture.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      db.news.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { content: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      db.directory.findMany({
        where: {
          OR: [
            { businessName: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    const results = [
      ...wildlife.map((w) => {
        const slug = w.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          label: w.name,
          type: "wildlife",
          id: w.id,
          url: `/wildlife/${slug}-${w.id}`,
        };
      }),
      ...adventure.map((a) => {
        const slug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          label: a.name,
          type: "adventure",
          id: a.id,
          url: `/adventure/${slug}-${a.id}`,
        };
      }),
      ...culture.map((c) => {
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          label: c.name,
          type: "culture",
          id: c.id,
          url: `/culture/${slug}-${c.id}`,
        };
      }),
      ...news.map((n) => ({
        label: n.title,
        type: "news",
        id: n.id,
        url: `/news/${encodeURIComponent(n.url || String(n.id))}`,
      })),
      ...directory.map((d) => {
        const slug = d.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          label: d.businessName,
          type: "directory",
          id: d.id,
          url: `/listing/${slug}-${d.id}`,
        };
      }),
    ];

    // Log search entry
    db.search.create({
      data: {
        searchTerm: term,
        searchCategory: "global",
      },
    }).catch(() => null);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
