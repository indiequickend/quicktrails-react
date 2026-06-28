import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import ItineraryCard from '@/components/ItineraryCard';
import JsonLd from '@/components/JsonLd';
import TrackPageView from '@/components/TrackPageView';
import {
  getPublicDestinationBySlug,
  getChildDestinations,
  getSiblingDestinations,
} from '@/lib/actions/destinations';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Itinerary from '@/models/Itinerary';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const dest = await getPublicDestinationBySlug(slug);
  if (!dest) return { title: 'Destination Not Found' };

  const defaultTitle = dest.parentSlug
    ? `${dest.name} Hotels & Tour Packages | ${SITE_NAME}`
    : `${dest.name} Travel Guide | Hotels & Tour Packages | ${SITE_NAME}`;

  return {
    title: dest.seoTitle || defaultTitle,
    description: dest.seoDescription || `Explore handpicked hotels, resorts, and tour packages in ${dest.name} with ${SITE_NAME}.`,
    keywords: [...(dest.keywords || []), ...(dest.longTailKeywords || [])],
    alternates: { canonical: `${SITE_URL}/destination/${slug}` },
    openGraph: {
      title: dest.seoTitle || defaultTitle,
      description: dest.seoDescription,
      url: `${SITE_URL}/destination/${slug}`,
      images: dest.heroImage ? [{ url: dest.heroImage, alt: dest.name }] : [],
    },
  };
}

async function getDestinationContent(name, slug, parentSlug) {
  await dbConnect();
  const [properties, packages, children, siblings] = await Promise.all([
    Property.find({ location: { $regex: name, $options: 'i' } }).sort('-rating').limit(12).lean(),
    Itinerary.find({ destinations: slug, status: 'FINALIZED' }).sort('-updatedAt').limit(8).lean(),
    getChildDestinations(slug),
    getSiblingDestinations(parentSlug, slug),
  ]);
  return {
    properties: JSON.parse(JSON.stringify(properties)),
    packages: JSON.parse(JSON.stringify(packages)),
    children,
    siblings,
  };
}

export default async function DestinationPage({ params }) {
  const { slug } = await params;
  const dest = await getPublicDestinationBySlug(slug);
  if (!dest) notFound();

  const isRegion = !dest.parentSlug;
  const { properties, packages, children, siblings } = await getDestinationContent(
    dest.name, dest.slug, dest.parentSlug
  );

  // Fetch parent destination for breadcrumb
  const parentDest = dest.parentSlug ? await getPublicDestinationBySlug(dest.parentSlug) : null;

  // --- JSON-LD ---
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    ...(parentDest ? [{ '@type': 'ListItem', position: 2, name: parentDest.name, item: `${SITE_URL}/destination/${parentDest.slug}` }] : []),
    { '@type': 'ListItem', position: parentDest ? 3 : 2, name: dest.name, item: `${SITE_URL}/destination/${slug}` },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const touristSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.seoDescription || dest.tagline || '',
    url: `${SITE_URL}/destination/${slug}`,
    ...(dest.heroImage && { image: dest.heroImage }),
    ...(parentDest && {
      containedInPlace: {
        '@type': 'TouristDestination',
        name: parentDest.name,
        url: `${SITE_URL}/destination/${parentDest.slug}`,
      },
    }),
    touristType: 'Leisure travellers',
  };

  const focusKw = dest.focusKeyword || `${dest.name} tour packages`;

  return (
    <>
      <TrackPageView path={`/destination/${slug}`} slug={slug} refType="page" />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={touristSchema} />
      <Header />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-80 flex items-end overflow-hidden">
        {dest.heroImage ? (
          <Image src={dest.heroImage} alt={`${dest.name} - travel destination`} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-slate-300 text-sm mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            {parentDest && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <Link href={`/destination/${parentDest.slug}`} className="hover:text-white transition">{parentDest.name}</Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-white">{dest.name}</span>
          </nav>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {dest.name}
          </h1>
          {dest.tagline && (
            <p className="text-xl text-slate-200 max-w-2xl">{dest.tagline}</p>
          )}

          {/* Quick stats */}
          <div className="flex items-center gap-5 mt-5 text-sm text-slate-300">
            {properties.length > 0 && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {properties.length} stay{properties.length !== 1 ? 's' : ''}</span>
            )}
            {packages.length > 0 && (
              <span>{packages.length} tour package{packages.length !== 1 ? 's' : ''}</span>
            )}
            {children.length > 0 && (
              <span>{children.length} {children.length === 1 ? 'city' : 'cities'} to explore</span>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {dest.description && (
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="rich-content max-w-none"
              dangerouslySetInnerHTML={{ __html: dest.description }}
            />
          </div>
        </section>
      )}

      {/* Child cities (region pages only) */}
      {children.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ letterSpacing: '-0.01em' }}>
              Cities &amp; places in {dest.name}
            </h2>
            <p className="text-muted-foreground mb-8">Explore each destination individually for curated stays and itineraries</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {children.map((child) => (
                <Link
                  key={child._id}
                  href={`/destination/${child.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 shadow hover:shadow-lg transition-shadow"
                >
                  {child.heroImage && (
                    <Image src={child.heroImage} alt={child.name} fill sizes="250px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm leading-tight">{child.name}</p>
                    {child.tagline && <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">{child.tagline}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stays */}
      {properties.length > 0 && (
        <section className={`py-20 ${children.length > 0 ? 'bg-background' : 'bg-muted'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
                Best hotels &amp; stays in {dest.name}
              </h2>
              <p className="text-muted-foreground text-lg">
                Handpicked {isRegion ? `properties across ${dest.name}` : `stays in ${dest.name}`} — verified for quality and value
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={`/properties?location=${encodeURIComponent(dest.name)}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition"
              >
                View all stays in {dest.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className={`py-20 ${children.length > 0 || properties.length > 0 ? 'bg-muted' : 'bg-background'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
                {focusKw.charAt(0).toUpperCase() + focusKw.slice(1)}
              </h2>
              <p className="text-muted-foreground text-lg">Curated itineraries designed by our travel experts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {packages.map((it) => (
                <ItineraryCard key={it._id} itinerary={it} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sibling cities (city pages only) */}
      {siblings.length > 0 && parentDest && (
        <section className="py-16 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6">More places in {parentDest.name}</h2>
            <div className="flex flex-wrap gap-3">
              {siblings.map((sib) => (
                <Link
                  key={sib._id}
                  href={`/destination/${sib.slug}`}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm hover:bg-muted hover:border-foreground/20 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {sib.name}
                </Link>
              ))}
              <Link
                href={`/destination/${parentDest.slug}`}
                className="flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5 text-primary rounded-full text-sm hover:bg-primary/10 transition font-medium"
              >
                Explore all of {parentDest.name} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {properties.length === 0 && packages.length === 0 && children.length === 0 && (
        <section className="py-24 bg-background">
          <div className="max-w-2xl mx-auto px-4 text-center text-muted-foreground">
            <p className="text-lg">We&apos;re curating stays and packages for {dest.name}. Check back soon!</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Planning a trip to {dest.name}?</h2>
          <p className="text-slate-300 text-lg mb-8">
            Let our travel experts build a custom itinerary — handpicked stays, curated activities, no hassle.
          </p>
          <Link
            href="/#enquiry"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition text-lg"
          >
            Get a custom itinerary <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
