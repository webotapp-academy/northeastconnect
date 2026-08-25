export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parses an ID from a URL parameter that may be a plain numeric ID (e.g. "9")
 * or an SEO slug with ID at the end (e.g. "software-engineer-guwahati-9").
 */
export function parseEntityId(param: string | number | undefined | null): number {
  if (!param) return 0;
  const str = String(param).trim();
  const match = str.match(/(?:^|-)(\d+)$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const direct = parseInt(str, 10);
  return isNaN(direct) ? 0 : direct;
}

/**
 * Returns an SEO-friendly URL for a job opening.
 * e.g. "/jobs/senior-react-developer-tech-corp-guwahati-9"
 */
export function getJobSlugUrl(job: {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  district?: string | null;
  state?: string | null;
}): string {
  const parts = [
    job.title,
    job.company,
    job.location || job.district || job.state,
  ]
    .filter(Boolean)
    .join(" ");

  const cleanSlug = slugify(parts).slice(0, 80).replace(/-+$/, "");
  return `/jobs/${cleanSlug || "opening"}-${job.id}`;
}
