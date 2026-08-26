import { db } from "@/lib/db";
import { notFound, permanentRedirect } from "next/navigation";

// Legacy path. The canonical, indexable listing page lives at /listing/{slug}-{id};
// this route only ever permanently redirects there so the same business is never
// reachable — and never indexed — at two different URLs.
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DirectoryLegacyRedirect({ params }: PageProps) {
  const { id } = await params;
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  if (isNaN(numericId)) {
    notFound();
  }

  const business = await db.directory.findUnique({
    where: { id: numericId },
    select: { id: true, businessName: true },
  });

  if (!business) {
    notFound();
  }

  const slug = business.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  permanentRedirect(`/listing/${slug}-${business.id}`);
}
