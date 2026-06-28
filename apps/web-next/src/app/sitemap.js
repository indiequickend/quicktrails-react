import { getAllSlugs, getDestinationSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

// Real server-rendered sitemap.xml (Next.js file convention) -- generated
// fresh from MongoDB on each request to this route, cached per `revalidate`.
// Unlike the old React-route version, this is plain XML with the correct
// Content-Type, readable by crawlers with no JavaScript involved.
export const revalidate = 3600;

export default async function sitemap() {
  const [{ properties, packages }, destinations] = await Promise.all([
    getAllSlugs(),
    getDestinationSlugs(),
  ]);

  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/destinations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/properties`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tour-packages`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const propertyRoutes = properties.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const packageRoutes = packages.map((p) => ({
    url: `${SITE_URL}/package/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Region pages get higher priority than city pages — hub-and-spoke hierarchy
  const destinationRoutes = destinations.map((d) => ({
    url: `${SITE_URL}/destination/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: d.parentSlug ? 0.8 : 0.9,
  }));

  return [...staticRoutes, ...destinationRoutes, ...propertyRoutes, ...packageRoutes];
}
