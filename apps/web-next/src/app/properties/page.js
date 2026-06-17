import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getProperties } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata = {
  title: "Properties",
  description: "Browse handpicked hotels, resorts, villas and homestays across India with QuickTrails.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage() {
  const properties = await getProperties({ sort: "-rating" });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Properties",
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
      <JsonLd data={itemListSchema} />
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Properties", path: "/properties" }]} />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">All properties</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            Handpicked stays that offer comfort, style, and unforgettable experiences across India.
          </p>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No properties available at the moment.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
