import Image from "next/image";
import { ArrowRight, MapPin, BadgeCheck, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PackageCard from "@/components/PackageCard";
import JsonLd from "@/components/JsonLd";
import { getProperties, getPackages } from "@/lib/data";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

// Regenerate this page in the background at most once an hour so new
// properties/packages show up without a full redeploy (ISR).
export const revalidate = 3600;

export const metadata = {
  title: `${SITE_NAME} - Discover Your Next Adventure`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const features = [
  { icon: MapPin, title: "Handpicked destinations", description: "Curated, not crowdsourced" },
  { icon: BadgeCheck, title: "Verified stays", description: "Every property personally vetted" },
  { icon: Sparkles, title: "Custom itineraries", description: "Trips tailored to you" },
  { icon: Award, title: "Best prices", description: "Guaranteed value" },
];

export default async function HomePage() {
  const [properties, packages] = await Promise.all([
    getProperties({ limit: 4, sort: "-rating" }),
    getPackages({ limit: 4 }),
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+91-89105-69649",
    email: "contact@quicktrails.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "205, Indira Gandhi Road",
      addressLocality: "Konnagar",
      addressRegion: "West Bengal",
      postalCode: "712235",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <Header transparent />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            // src="https://images.unsplash.com/photo-1688835175405-b60bf1ce6eff?w=1920&q=80"
            src="/sandakphu-img.jpeg"
            alt="Sandakphu, India - A breathtaking view of the Himalayas from Sandakphu, showcasing snow-capped peaks and lush greenery under a clear blue sky."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance" style={{ letterSpacing: "-0.02em" }}>
            Discover your next adventure
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Handpicked properties and curated travel experiences across India&apos;s most breathtaking destinations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/properties" size="lg" className="text-lg px-8 py-6">
              Browse properties
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              href="/tour-packages"
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Explore packages
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance" style={{ letterSpacing: "-0.02em" }}>
              Featured properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked stays that offer comfort, style, and unforgettable experiences
            </p>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No properties available at the moment.</p>
          )}

          <div className="text-center mt-12">
            <Button href="/properties" size="lg" variant="outline">
              View all properties
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance" style={{ letterSpacing: "-0.02em" }}>
              Popular tour packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Curated journeys designed to create memories that last a lifetime
            </p>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No packages available at the moment.</p>
          )}

          <div className="text-center mt-12">
            <Button href="/tour-packages" size="lg" variant="outline">
              Explore all packages
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
