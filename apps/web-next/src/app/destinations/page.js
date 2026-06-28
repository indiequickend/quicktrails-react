import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import TrackPageView from "@/components/TrackPageView";
import { getPublicDestinations } from "@/lib/actions/destinations";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

export const metadata = {
  title: "Destinations",
  description: `Explore all travel destinations across India handpicked by ${SITE_NAME} — find hotels, resorts and curated tour packages by location.`,
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const all = await getPublicDestinations();

  const regions = all.filter((d) => !d.parentSlug);
  const cities = all.filter((d) => !!d.parentSlug);

  // Map parentSlug → child destinations for quick lookup
  const childrenByParent = cities.reduce((acc, city) => {
    if (!acc[city.parentSlug]) acc[city.parentSlug] = [];
    acc[city.parentSlug].push(city);
    return acc;
  }, {});

  // Cities whose parent isn't in the regions list (orphaned city pages)
  const orphanedCities = cities.filter(
    (c) => !regions.find((r) => r.slug === c.parentSlug)
  );

  return (
    <>
      <TrackPageView path="/destinations" slug="destinations" refType="page" />
      <Header />

      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Destinations", path: "/destinations" },
            ]}
          />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Explore destinations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-16">
            Handpicked travel destinations across India — browse hotels, resorts and curated tour packages by location.
          </p>

          {/* Regions */}
          {regions.length > 0 && (
            <div className="space-y-16">
              {regions.map((region) => {
                const regionCities = childrenByParent[region.slug] || [];
                return (
                  <div key={region._id}>
                    {/* Region card */}
                    <Link
                      href={`/destination/${region.slug}`}
                      className="group relative flex rounded-2xl overflow-hidden h-64 md:h-80 bg-slate-800 shadow-md hover:shadow-xl transition-shadow"
                    >
                      {region.heroImage && (
                        <Image
                          src={region.heroImage}
                          alt={region.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 1200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
                      <div className="relative z-10 flex flex-col justify-end p-8">
                        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
                          Destination
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {region.name}
                        </h2>
                        {region.tagline && (
                          <p className="text-slate-300 text-lg mb-4">{region.tagline}</p>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-white font-medium text-sm group-hover:gap-3 transition-all">
                          Explore {region.name} <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>

                    {/* Child cities */}
                    {regionCities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-3 font-medium">
                          Cities &amp; places in {region.name}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {regionCities.map((city) => (
                            <Link
                              key={city._id}
                              href={`/destination/${city.slug}`}
                              className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-800 shadow hover:shadow-md transition-shadow"
                            >
                              {city.heroImage && (
                                <Image
                                  src={city.heroImage}
                                  alt={city.name}
                                  fill
                                  sizes="200px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                <p className="text-white font-semibold text-sm leading-tight">{city.name}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Orphaned cities (no parent region) */}
          {orphanedCities.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">More destinations</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {orphanedCities.map((city) => (
                  <Link
                    key={city._id}
                    href={`/destination/${city.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 shadow hover:shadow-md transition-shadow"
                  >
                    {city.heroImage && (
                      <Image
                        src={city.heroImage}
                        alt={city.name}
                        fill
                        sizes="300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold">{city.name}</p>
                      {city.tagline && (
                        <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">{city.tagline}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {all.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No destinations published yet.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
