export interface AuthorProfile {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  badges: string[];
  sameAs: string[];
}

const PABAN_BHUYAN: AuthorProfile = {
  slug: "paban-bhuyan",
  name: "Paban Bhuyan",
  role: "Founder & Publisher, North East Connect",
  bio: "Founded Webotapp in 2009 — 15+ years of experience in web development, digital publishing, and community platforms, with clients across 50+ countries. North East Connect's editorial process is run under his oversight, in-house, with every story checked against named regional sources before publishing.",
  photo: "/assets/images/team/paban-bhuyan.png",
  badges: ["Founded 2009", "50+ Countries", "15+ Years Exp."],
  sameAs: [
    "https://webotapp.com",
    "https://academy.webotapp.com",
  ],
};

// Legacy DB rows (and any article authored before a real byline was wired up) carry a
// generic string like "North East Connect Editorial" — map every known variant to the
// one real, named profile rather than showing an anonymous byline.
const AUTHOR_REGISTRY: Record<string, AuthorProfile> = {
  "paban bhuyan": PABAN_BHUYAN,
  "north east connect editorial": PABAN_BHUYAN,
  "editorial team": PABAN_BHUYAN,
  "north east connect": PABAN_BHUYAN,
};

export const AUTHORS: AuthorProfile[] = [PABAN_BHUYAN];

export function getAuthorProfile(rawName: string | null | undefined): AuthorProfile {
  const key = (rawName || "").trim().toLowerCase();
  return AUTHOR_REGISTRY[key] || PABAN_BHUYAN;
}

export function getAuthorBySlug(slug: string): AuthorProfile | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}
