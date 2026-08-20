import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default popular hashtags for Northeast India
const SEED_HASHTAGS = [
  { tag: "kaziranga", count: 48 },
  { tag: "guwahati", count: 42 },
  { tag: "shillong", count: 37 },
  { tag: "assamtea", count: 29 },
  { tag: "northeastindia", count: 56 },
  { tag: "tawang", count: 22 },
  { tag: "cherrapunji", count: 26 },
  { tag: "majuli", count: 19 },
  { tag: "nagaland", count: 25 },
  { tag: "sikkimdiaries", count: 31 },
  { tag: "manipur", count: 18 },
  { tag: "mizoram", count: 15 },
  { tag: "tripuratourism", count: 14 },
  { tag: "homestay", count: 27 },
  { tag: "localfood", count: 33 },
  { tag: "trekking", count: 21 },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase().replace(/^#/, "").trim();

    let dbHashtags: any[] = [];
    try {
      if ((db as any).hashtag) {
        dbHashtags = await (db as any).hashtag.findMany({
          where: query
            ? {
                tag: {
                  contains: query,
                  mode: "insensitive",
                },
              }
            : undefined,
          orderBy: { count: "desc" },
          take: 15,
        });
      }
    } catch (e) {
      console.warn("Hashtag query fallback to seeds:", e);
    }

    // Merge with popular seeds
    const map = new Map<string, number>();

    // Add DB tags first
    for (const h of dbHashtags) {
      map.set(h.tag.toLowerCase(), h.count);
    }

    // Add seed tags if not already present
    for (const seed of SEED_HASHTAGS) {
      if (!query || seed.tag.toLowerCase().includes(query)) {
        if (!map.has(seed.tag.toLowerCase())) {
          map.set(seed.tag.toLowerCase(), seed.count);
        }
      }
    }

    const results = Array.from(map.entries()).map(([tag, count]) => ({
      tag,
      count,
    }));

    return NextResponse.json({
      status: "success",
      hashtags: results,
    });
  } catch (error: any) {
    console.error("Hashtag search error:", error);
    // Return seeds on error
    return NextResponse.json({
      status: "success",
      hashtags: SEED_HASHTAGS,
    });
  }
}
