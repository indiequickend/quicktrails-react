import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import TrackPageView from "@/components/TrackPageView";
import { PackageFilterBar } from "@/components/PackageFilterBar";
import PackagesInfiniteGrid from "@/components/PackagesInfiniteGrid";
import { getPackagesPage, getPackageFilterOptions } from "@/lib/actions/listings";
import { parseListParam } from "@/lib/searchParamsUtil";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const PAGE_SIZE = 12;

function parseFilters(params) {
  return {
    destinations: parseListParam(params.destinations),
    duration: params.duration || undefined,
    sort: params.sort || "newest",
  };
}

function isFiltered(filters) {
  return filters.destinations.length > 0 || !!filters.duration;
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);

  if (isFiltered(filters)) {
    return { title: "Tour Packages", robots: { index: false } };
  }

  return {
    title: "Tour Packages",
    description: "Curated multi-day tour packages across India's most breathtaking destinations, planned end-to-end by QuickTrails.",
    alternates: { canonical: "/tour-packages" },
  };
}

export default async function PackagesPage({ searchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const filtered = isFiltered(filters);

  const [{ items: itineraries, hasMore }, filterOptions] = await Promise.all([
    getPackagesPage({ filters, skip: 0, limit: PAGE_SIZE }),
    getPackageFilterOptions(),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tour Packages",
    url: `${SITE_URL}/tour-packages`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itineraries.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/package/${p.slug || p._id}`,
        name: p.tripTitle,
      })),
    },
  };

  return (
    <>
      <TrackPageView path="/tour-packages" slug="tour-packages" refType="page" />
      <JsonLd data={itemListSchema} />
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Tour Packages", path: "/tour-packages" }]} />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">All tour packages</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            {filtered
              ? "Results matching your filters."
              : "Curated journeys designed to create memories that last a lifetime."}
          </p>

          <PackageFilterBar options={filterOptions} />

          <PackagesInfiniteGrid
            key={JSON.stringify(filters)}
            initialItems={itineraries}
            initialHasMore={hasMore}
            filters={filters}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
