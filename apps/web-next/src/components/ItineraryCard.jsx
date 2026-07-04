import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

export default function ItineraryCard({ itinerary }) {
    const heroImage = itinerary.heroGallery?.[0] || null;
    const previewInclusions = (itinerary.inclusions || []).slice(0, 3);

    return (
        <Link href={`/package/${itinerary.slug || itinerary._id}`} className="group block h-full">
            <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="relative h-56 overflow-hidden flex-shrink-0 bg-muted">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={itinerary.tripTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <span className="text-slate-500 text-sm">No image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {itinerary.durationText && (
                        <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {itinerary.durationText}
                        </div>
                    )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-3 text-balance group-hover:text-primary transition-colors line-clamp-2">
                        {itinerary.tripTitle}
                    </h3>

                    {previewInclusions.length > 0 && (
                        <ul className="space-y-1 mb-4">
                            {previewInclusions.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                    <span className="line-clamp-1">{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {itinerary.days?.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-4">
                            {itinerary.days.length} day{itinerary.days.length !== 1 ? 's' : ''} planned
                        </p>
                    )}

                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
                        <div>
                            {itinerary.totalPrice ? (
                                <>
                                    <span className="text-lg font-bold text-primary">{itinerary.totalPrice}</span>
                                    {/* <span className="text-muted-foreground text-sm ml-1">/person</span> */}
                                </>
                            ) : (
                                <span className="text-muted-foreground text-sm">Contact for price</span>
                            )}
                        </div>
                        <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors duration-200">
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
