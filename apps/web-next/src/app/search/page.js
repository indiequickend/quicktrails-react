import Image from "next/image";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import ItineraryCard from "@/components/ItineraryCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import TrackPageView from "@/components/TrackPageView";
import { Input } from "@/components/ui/Input";
import { searchAll } from "@/lib/actions/search";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `Search results for "${q}"`,
      robots: { index: false },
    };
  }
  return {
    title: "Search",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }) {
  const { q = "" } = await searchParams;
  const hasQuery = !!q.trim();
  const { properties, itineraries, destinations } = await searchAll(q);
  const totalResults = properties.length + itineraries.length + destinations.length;

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
  ];

  return (
    <>
      <TrackPageView path="/search" slug="search" refType="page" />
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {hasQuery ? `Search results for "${q}"` : "Search"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Find properties, packages and destinations across QuickTrails.
          </p>

          <form action="/search" method="GET" className="relative max-w-xl mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search properties, packages, destinations…"
              className="pl-12 pr-4 h-14 text-lg rounded-full"
              autoFocus
            />
          </form>

          {!hasQuery && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Start typing to search stays, packages and destinations.</p>
            </div>
          )}

          {hasQuery && totalResults === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <SearchX className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-4">No results for &ldquo;{q}&rdquo;.</p>
              <Link href="/search" className="text-primary underline underline-offset-2">
                Try another search
              </Link>
            </div>
          )}

          {destinations.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Destinations</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {destinations.map((destination) => (
                  <Link
                    key={destination._id}
                    href={`/destination/${destination.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 shadow hover:shadow-md transition-shadow"
                  >
                    {destination.heroImage && (
                      <Image
                        src={destination.heroImage}
                        alt={destination.name}
                        fill
                        sizes="300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold">{destination.name}</p>
                      {destination.tagline && (
                        <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">{destination.tagline}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {properties.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </section>
          )}

          {itineraries.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itineraries.map((itinerary) => (
                  <ItineraryCard key={itinerary._id} itinerary={itinerary} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
