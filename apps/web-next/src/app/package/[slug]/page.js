import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ItineraryCard from "@/components/ItineraryCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookingForm from "@/components/BookingForm";
import JsonLd from "@/components/JsonLd";
import { getBrandSettings } from "@/lib/actions/brand-settings";
import { getPublicItineraries } from "@/lib/actions/itineraries";
import dbConnect from "@/lib/mongodb";
import Itinerary from "@/models/Itinerary";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const itineraries = await getPublicItineraries(200);
  return itineraries.filter((i) => i.slug).map((i) => ({ slug: i.slug }));
}

async function getItinerary(slug) {
  try {
    await dbConnect();
    const doc = await Itinerary.findOne({ slug }).lean();
    if (!doc || doc.status !== 'FINALIZED' || doc.b2bDetails?.isB2B) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch {
    return null;
  }
}

async function getRelatedItineraries(currentSlug, limit = 3) {
  try {
    await dbConnect();
    const docs = await Itinerary.find({ slug: { $ne: currentSlug }, status: 'FINALIZED', 'b2bDetails.isB2B': { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(docs));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const itinerary = await getItinerary(slug);
  if (!itinerary) return {};
  return {
    title: itinerary.tripTitle,
    description: `${itinerary.durationText} tour package — ${itinerary.tripTitle}. Curated by QuickTrails.`,
    alternates: { canonical: `/package/${slug}` },
    openGraph: {
      title: itinerary.tripTitle,
      images: itinerary.heroGallery?.[0] ? [itinerary.heroGallery[0]] : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  const [itinerary, brandSettings] = await Promise.all([
    getItinerary(slug),
    getBrandSettings().catch(() => null),
  ]);

  if (!itinerary) notFound();

  const relatedItineraries = await getRelatedItineraries(slug);
  const heroImage = itinerary.heroGallery?.[0] || null;
  const logoUrl = brandSettings?.primaryLogoUrl || null;
  const companyName = brandSettings?.companyName || 'QuickTrails';

  const dayTitles = itinerary.days?.map((d) => d.dayTitle).filter(Boolean).join(", ");

  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: itinerary.tripTitle,
    description: [
      itinerary.durationText,
      dayTitles ? `Covering: ${dayTitles}` : null,
    ].filter(Boolean).join(" — "),
    image: itinerary.heroGallery?.filter(Boolean) ?? [],
    url: `${SITE_URL}/package/${slug}`,
    provider: {
      "@type": "TravelAgency",
      name: companyName,
      url: SITE_URL,
      ...(logoUrl ? { logo: logoUrl } : {}),
    },
    offers: itinerary.totalPrice
      ? {
        "@type": "Offer",
        name: itinerary.totalPrice,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      }
      : undefined,
    itinerary: itinerary.days?.length > 0
      ? {
        "@type": "ItemList",
        itemListElement: itinerary.days.map((day, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: day.dayTitle || `Day ${day.dayNumber}`,
          ...(day.dayDescription ? { description: day.dayDescription } : {}),
        })),
      }
      : undefined,
  };

  return (
    <>
      <JsonLd data={tourSchema} />
      <Header />

      {/* Hero Section — matches builder preview */}
      <div className="relative w-full h-[80vh] min-h-[500px] bg-gray-900 overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={itinerary.tripTitle} className="absolute inset-0 w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Logo + company name — top left */}
        {/* <div className="absolute top-24 left-8 sm:left-16 flex items-center gap-4 z-10">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-10 w-auto object-contain drop-shadow-md" />
          ) : null}
          <span className="font-serif tracking-widest text-lg font-bold text-white drop-shadow-md">{companyName}</span>
        </div> */}

        {/* Trip info — bottom left */}
        <div className="absolute bottom-12 left-8 sm:left-16 right-8 sm:right-16 z-10">
          <div className="max-w-3xl">
            <Breadcrumbs
              items={[{ name: "Home", path: "/" }, { name: "Tour Packages", path: "/tour-packages" }, { name: itinerary.tripTitle, path: `/package/${slug}` }]}
            />
            <p className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3 mt-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-400 inline-block"></span>
              {itinerary.durationText || ''}
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight drop-shadow-xl mb-4">
              {itinerary.tripTitle}
            </h1>
            {itinerary.totalPrice && (
              <p className="text-2xl text-white font-bold drop-shadow-md">{itinerary.totalPrice}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left: Itinerary content */}
            <div className="lg:col-span-2">

              {/* Day-by-day schedule */}
              {itinerary.days?.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-10">Day-by-Day Itinerary</h2>
                  <div className="space-y-12">
                    {itinerary.days.map((day, index) => (
                      <div key={index} className="flex gap-6 sm:gap-10">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {day.dayNumber}
                          </div>
                          {index !== itinerary.days.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-4 min-h-[2rem]"></div>
                          )}
                        </div>
                        <div className="pt-1 w-full pb-4">
                          <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                            {day.dayTitle || `Day ${day.dayNumber}`}
                          </h3>
                          {day.dayDescription && (
                            <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-amber-400 pl-4 py-1 bg-amber-50/50 mb-6 rounded-r">
                              {day.dayDescription}
                            </p>
                          )}
                          {day.activities?.length > 0 && (
                            <div className="space-y-6 mt-4">
                              {day.activities.map((act, ai) => (
                                <div key={ai} className="flex flex-col sm:flex-row gap-5 p-5 border border-border rounded-xl bg-card shadow-sm">
                                  {act.imageUrl && (
                                    <div className="w-full sm:w-44 h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
                                      <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-grow">
                                    <h4 className="font-bold text-lg text-foreground mb-1">{act.title}</h4>
                                    {act.tags?.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        {act.tags.map((tag, ti) => (
                                          <span key={ti} className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">{tag}</span>
                                        ))}
                                      </div>
                                    )}
                                    {act.description && (
                                      <p className="text-sm text-muted-foreground leading-relaxed">{act.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Inclusions & Exclusions */}
              {(itinerary.inclusions?.length > 0 || itinerary.exclusions?.length > 0) && (
                <section className="mb-16 pt-8 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {itinerary.inclusions?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-foreground mb-5 flex items-center gap-2">
                          <span className="text-green-600">✓</span> Inclusions
                        </h3>
                        <ul className="space-y-3">
                          {itinerary.inclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                              <span className="text-green-500 mt-0.5 shrink-0 text-[10px]">✦</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {itinerary.exclusions?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-foreground mb-5 flex items-center gap-2">
                          <span className="text-red-600">✗</span> Exclusions
                        </h3>
                        <ul className="space-y-3">
                          {itinerary.exclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="text-red-400 mt-0.5 shrink-0 text-[10px]">✦</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Terms & Conditions */}
              {itinerary.terms && itinerary.terms.trim() !== '' && (
                <section className="mb-16 pt-8 border-t border-border">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Terms & Conditions</h3>
                  <div
                    className="text-muted-foreground leading-relaxed space-y-3 text-sm [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 [&_strong]:font-bold [&_strong]:text-foreground [&_b]:font-bold [&_b]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: itinerary.terms }}
                  />
                </section>
              )}
            </div>

            {/* Right: Sticky booking sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-32">
                {itinerary.totalPrice && (
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary mb-1">{itinerary.totalPrice}</div>
                    {/* <div className="text-muted-foreground text-sm">/person</div> */}
                  </div>
                )}
                <BookingForm packageSlug={slug} />
              </div>
            </div>
          </div>

          {/* Related packages */}
          {relatedItineraries.length > 0 && (
            <div className="mt-24 pt-16 border-t border-border">
              <h2 className="text-3xl font-serif font-bold mb-8">More Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedItineraries.map((i) => (
                  <ItineraryCard key={i._id} itinerary={i} />
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
