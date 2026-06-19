import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function PackageCard({ pkg }) {
  const highlights = (pkg.highlights || []).slice(0, 3);

  return (
    <Link href={`/package/${pkg.slug}`} className="group block h-full">
      <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 flex flex-col h-full">
        <div className="relative h-56 overflow-hidden flex-shrink-0 bg-muted">
          {pkg.heroImage?.url ? (
            <Image
              src={pkg.heroImage.url}
              alt={pkg.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : null}
          <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {pkg.duration} days
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2 text-balance group-hover:text-primary transition-colors">
            {pkg.name}
          </h3>

          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{pkg.destination}</span>
          </div>

          {highlights.length > 0 && (
            <div className="space-y-2 mb-4">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start text-sm">
                  <Sparkles className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
            <div>
              <span className="text-2xl font-bold text-primary">{formatINR(pkg.price)}</span>
              <span className="text-muted-foreground text-sm ml-1">/person</span>
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
