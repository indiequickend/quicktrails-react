import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Calendar, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookingForm from "@/components/BookingForm";
import JsonLd from "@/components/JsonLd";
import { getPackageBySlug, getAllSlugs } from "@/lib/data";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import { formatINR } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { packages } = await getAllSlugs();
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return {};

  const description =
    pkg.description ||
    `Book ${pkg.name} - ${pkg.duration} days tour package to ${pkg.destination}. Curated itinerary with all amenities included.`;

  return {
    title: pkg.name,
    description,
    alternates: { canonical: `/package/${pkg.slug}` },
    openGraph: {
      title: pkg.name,
      description,
      images: pkg.heroImage?.url ? [pkg.heroImage.url] : undefined,
    },
  };
}

async function getRelatedByDestination(pkg, limit = 4) {
  await dbConnect();
  const docs = await Package.find({ _id: { $ne: pkg._id }, destination: pkg.destination })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const relatedPackages = await getRelatedByDestination(pkg);

  const itinerary = pkg.itinerary || [];
  const amenities = pkg.includedAmenities || [];
  const highlights = pkg.highlights || [];

  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.name,
    description: pkg.description,
    touristType: "Leisure",
    itinerary: itinerary.map((day) => ({
      "@type": "TouristAttraction",
      name: day.title,
      description: day.description,
    })),
    offers: {
      "@type": "Offer",
      price: pkg.price,
      priceCurrency: "INR",
    },
  };

  return (
    <>
      <JsonLd data={tourSchema} />
      <Header />

      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Tour Packages", path: "/tour-packages" },
              { name: pkg.name, path: `/package/${pkg.slug}` },
            ]}
          />

          <div className="relative h-96 rounded-2xl overflow-hidden mb-12">
            {pkg.heroImage?.url && (
              <Image
                src={pkg.heroImage.url}
                alt={pkg.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance" style={{ letterSpacing: "-0.02em" }}>
                {pkg.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-lg">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {pkg.destination}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {pkg.duration} days
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {pkg.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">About this package</h2>
                  <p className="text-muted-foreground leading-relaxed">{pkg.description}</p>
                </div>
              )}

              {highlights.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Package highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start bg-muted rounded-xl p-4">
                        <Sparkles className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itinerary.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-6">Day-by-day itinerary</h2>
                  <div className="space-y-4">
                    {itinerary.map((day) => (
                      <div key={day.day} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                          {day.day}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{day.title}</h3>
                          <p className="text-muted-foreground text-sm">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">What&apos;s included</h2>
                  <div className="bg-muted rounded-xl p-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4">Pricing breakdown</h2>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Package price (per person)</span>
                  <span className="text-xl font-semibold">{formatINR(pkg.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Price includes accommodation, meals, transport, and guided tours as per itinerary. Additional costs may apply for optional activities.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-32">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">{formatINR(pkg.price)}</div>
                  <div className="text-muted-foreground">/person</div>
                </div>
                <BookingForm packageSlug={pkg.slug} />
              </div>
            </div>
          </div>

          {relatedPackages.length > 0 && (
            <div className="mt-24">
              <h2 className="text-3xl font-bold mb-8">Similar packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedPackages.map((p) => (
                  <PackageCard key={p._id} pkg={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
