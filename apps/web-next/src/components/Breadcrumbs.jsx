import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";

// items: [{ name, path }] -- path is relative, e.g. "/properties"
export default function Breadcrumbs({ items }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6 flex-wrap gap-1">
        {items.map((item, idx) => (
          <span key={item.path} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="w-4 h-4" />}
            {idx === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-primary transition-colors">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
