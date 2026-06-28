import Link from "next/link";
import { X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getProperties } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";
import TrackPageView from "@/components/TrackPageView";

export const revalidate = 3600;

export async function generateMetadata({ searchParams }) {
  const { location } = await searchParams;
  if (location) {
    return {
      title: `Hotels & Stays in ${location}`,
      description: `Browse handpicked hotels, resorts and homestays in ${location} with QuickTrails.`,
      robots: { index: false },
    };
  }
  return {
    title: "Properties",
    description: "Browse handpicked hotels, resorts, villas and homestays across India with QuickTrails.",
    alternates: { canonical: "/properties" },
  };
}

export default async function PropertiesPage({ searchParams }) {
  const { location } = await searchParams;
  const isFiltered = !!location;

  const properties = await getProperties({
    sort: "-updatedAt",
    location: isFiltered ? location : undefined,
  });

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    ...(isFiltered ? [{ name: location, path: `/properties?location=${encodeURIComponent(location)}` }] : []),
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isFiltered ? `Hotels & Stays in ${location}` : "Properties",
    url: `${SITE_URL}/properties`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: properties.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/property/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <TrackPageView path="/properties" slug="properties" refType="page" />
      <JsonLd data={itemListSchema} />
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              {isFiltered ? `Stays in ${location}` : "All properties"}
            </h1>
            {isFiltered && (
              <Link
                href="/properties"
                className="flex items-center gap-1.5 mt-2 shrink-0 px-3 py-1.5 text-sm border border-border rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" /> Clear filter
              </Link>
            )}
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            {isFiltered
              ? `${properties.length} handpicked ${properties.length === 1 ? "stay" : "stays"} in ${location}`
              : "Handpicked stays that offer comfort, style, and unforgettable experiences across India."}
          </p>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg mb-4">No stays found in {location}.</p>
              <Link href="/properties" className="text-primary underline underline-offset-2">
                Browse all properties
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
