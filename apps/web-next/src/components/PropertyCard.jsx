import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ChevronRight } from "lucide-react";
import { formatINR, priceUnitLabel } from "@/lib/utils";

export default function PropertyCard({ property }) {
  const image = property.images?.[0];
  const cheapestRoom = property.roomTypes?.[0];

  return (
    <Link href={`/property/${property.slug}`} className="group block h-full">
      <div className="bg-card rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
        <div className="relative h-56 overflow-hidden flex-shrink-0 bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || property.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : null}
          {property.category && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {property.category}
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2 text-balance group-hover:text-primary transition-colors">
            {property.name}
          </h3>

          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>

          {property.rating > 0 && (
            <div className="flex items-center mb-4">
              <Star className="w-4 h-4 fill-accent text-accent mr-1" />
              <span className="font-medium">{property.rating}</span>
            </div>
          )}

          <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatINR(cheapestRoom?.price ?? 4500)}
              </span>
              <span className="text-muted-foreground text-sm ml-1">{priceUnitLabel(cheapestRoom?.priceUnit)}</span>
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
