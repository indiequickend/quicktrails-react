import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import PropertyCard from "@/components/PropertyCard";
import PropertyGallery from "@/components/PropertyGallery";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getPropertyBySlug, getRelatedProperties, getReviewsForProperty, getAllSlugs } from "@/lib/data";
import { formatINR, priceUnitLabel } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

// Pre-render every known property at build time -- new properties added
// later are rendered on first request and then cached (ISR fallback).
export async function generateStaticParams() {
  const { properties } = await getAllSlugs();
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const description =
    property.description ||
    `Book ${property.name} in ${property.location}. ${property.category} with top amenities and excellent reviews.`;

  return {
    title: property.name,
    description,
    alternates: { canonical: `/property/${property.slug}` },
    openGraph: {
      title: property.name,
      description,
      images: property.images?.[0]?.url ? [property.images[0].url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [relatedProperties, reviews] = await Promise.all([
    getRelatedProperties(property),
    getReviewsForProperty(property._id),
  ]);

  const images = property.images || [];
  const roomTypes = property.roomTypes || [];
  const amenities = property.amenities || [];

  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: property.name,
    description: property.description,
    image: images.map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location,
      addressCountry: "IN",
    },
    aggregateRating:
      reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: property.rating,
            reviewCount: reviews.length,
          }
        : undefined,
    starRating: property.rating ? { "@type": "Rating", ratingValue: property.rating } : undefined,
    priceRange:
      roomTypes.length > 0
        ? `₹${Math.min(...roomTypes.map((r) => r.price))} - ₹${Math.max(...roomTypes.map((r) => r.price))}`
        : undefined,
  };

  return (
    <>
      <JsonLd data={hotelSchema} />
      <Header />

      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Properties", path: "/properties" },
              { name: property.name, path: `/property/${property.slug}` },
            ]}
          />

          <PropertyGallery images={images} name={property.name} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-3 text-balance" style={{ letterSpacing: "-0.02em" }}>
                    {property.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  {property.rating > 0 && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-accent text-accent mr-1" />
                      <span className="font-semibold text-lg">{property.rating}</span>
                      <span className="text-muted-foreground ml-2">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                {property.category && (
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium">
                    {property.category}
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">About this property</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center bg-muted rounded-xl p-4">
                        <BadgeCheck className="w-5 h-5 text-primary mr-3" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {roomTypes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Room types</h2>
                  <div className="space-y-4">
                    {roomTypes.map((room, idx) => (
                      <div key={idx} className="bg-card border border-border rounded-xl p-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{room.type}</h3>
                          <p className="text-muted-foreground text-sm">{room.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{formatINR(room.price)}</div>
                          <div className="text-sm text-muted-foreground">{priceUnitLabel(room.priceUnit)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Guest reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-32">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatINR(roomTypes[0]?.price ?? 4500)}
                  </div>
                  <div className="text-muted-foreground">{priceUnitLabel(roomTypes[0]?.priceUnit)}</div>
                </div>
                <Button href={`/contact?property=${property.slug}`} size="lg" className="w-full mb-4">
                  Book now
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Contact us to check availability and make a reservation
                </p>
              </div>
            </div>
          </div>

          {relatedProperties.length > 0 && (
            <div className="mt-24">
              <h2 className="text-3xl font-bold mb-8">Similar properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProperties.map((p) => (
                  <PropertyCard key={p._id} property={p} />
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
