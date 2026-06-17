import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getPackages } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata = {
  title: "Tour Packages",
  description: "Curated multi-day tour packages across India's most breathtaking destinations, planned end-to-end by QuickTrails.",
  alternates: { canonical: "/tour-packages" },
};

export default async function PackagesPage() {
  const packages = await getPackages();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tour Packages",
    url: `${SITE_URL}/tour-packages`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: packages.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/package/${p.slug}`,
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
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Tour Packages", path: "/tour-packages" }]} />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">All tour packages</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            Curated journeys designed to create memories that last a lifetime.
          </p>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No packages available at the moment.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
