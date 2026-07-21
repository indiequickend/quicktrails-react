"use client";

import { useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/Button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getPropertiesPage } from "@/lib/actions/listings";

const PAGE_SIZE = 12;

export default function PropertiesInfiniteGrid({ initialItems, initialHasMore, filters }) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    const { items: next, hasMore: more } = await getPropertiesPage({
      filters,
      skip: items.length,
      limit: PAGE_SIZE,
    });
    setItems((prev) => [...prev, ...next]);
    setHasMore(more);
    setLoading(false);
  }

  const sentinelRef = useInfiniteScroll({ hasMore, loading, onLoadMore: loadMore });

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">No properties match these filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center mt-10">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
