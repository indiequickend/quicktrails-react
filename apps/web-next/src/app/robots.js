import { SITE_URL } from "@/lib/constants";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/waypoint/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
