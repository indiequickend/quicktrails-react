import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import TrackPageView from "@/components/TrackPageView";
import { PropertyFilterBar } from "@/components/PropertyFilterBar";
import PropertiesInfiniteGrid from "@/components/PropertiesInfiniteGrid";
import { getPropertiesPage, getPropertyFilterOptions } from "@/lib/actions/listings";
import { parseListParam } from "@/lib/searchParamsUtil";
import { SITE_URL } from "@/lib/constants";
import { titleCase } from "@/lib/utils";

export const revalidate = 3600;

const PAGE_SIZE = 12;

function parseFilters(params) {
  return {
    location: parseListParam(params.location),
    category: parseListParam(params.category),
    amenities: parseListParam(params.amenities),
    minRating: params.minRating ? Number(params.minRating) : undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: params.sort || "newest",
  };
}

function isFiltered(filters) {
  return (
    filters.location.length > 0 ||
    filters.category.length > 0 ||
    filters.amenities.length > 0 ||
    !!filters.minRating ||
    !!filters.minPrice ||
    !!filters.maxPrice
  );
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const singleLocation = filters.location.length === 1 ? filters.location[0] : null;

  if (singleLocation && !isFiltered({ ...filters, location: [] })) {
    const label = titleCase(singleLocation);
    return {
      title: `Hotels & Stays in ${label}`,
      description: `Browse handpicked hotels, resorts and homestays in ${label} with QuickTrails.`,
      alternates: { canonical: `/properties?location=${encodeURIComponent(singleLocation)}` },
    };
  }

  if (isFiltered(filters)) {
    return { title: "Properties", robots: { index: false } };
  }

  return {
    title: "Properties",
    description: "Browse handpicked hotels, resorts, villas and homestays across India with QuickTrails.",
    alternates: { canonical: "/properties" },
  };
}

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const filtered = isFiltered(filters);
  const singleLocation = filters.location.length === 1 ? filters.location[0] : null;
  const singleLocationLabel = singleLocation ? titleCase(singleLocation) : null;

  const [{ items: properties, hasMore }, filterOptions] = await Promise.all([
    getPropertiesPage({ filters, skip: 0, limit: PAGE_SIZE }),
    getPropertyFilterOptions(),
  ]);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    ...(singleLocation ? [{ name: singleLocationLabel, path: `/properties?location=${encodeURIComponent(singleLocation)}` }] : []),
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: singleLocationLabel ? `Hotels & Stays in ${singleLocationLabel}` : "Properties",
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

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {singleLocationLabel ? `Stays in ${singleLocationLabel}` : "All properties"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            {filtered
              ? "Results matching your filters."
              : "Handpicked stays that offer comfort, style, and unforgettable experiences across India."}
          </p>

          <PropertyFilterBar options={filterOptions} />

          <PropertiesInfiniteGrid
            key={JSON.stringify(filters)}
            initialItems={properties}
            initialHasMore={hasMore}
            filters={filters}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
