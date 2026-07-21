"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Select } from "@/components/ui/Input";
import { FilterDrawer } from "@/components/FilterDrawer";
import { parseListParam, buildQueryString } from "@/lib/searchParamsUtil";
import { formatINR, cn } from "@/lib/utils";

const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+" },
  { value: "4", label: "4+" },
  { value: "3.5", label: "3.5+" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
];

export function PropertyFilterBar({ options }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const location = parseListParam(searchParams.get("location"));
  const category = parseListParam(searchParams.get("category"));
  const amenities = parseListParam(searchParams.get("amenities"));
  const minRating = searchParams.get("minRating") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : options.priceMin;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : options.priceMax;

  const activeCount =
    location.length +
    category.length +
    amenities.length +
    (minRating ? 1 : 0) +
    (searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0);

  function updateParams(patch) {
    const next = {
      location,
      category,
      amenities,
      minRating,
      sort,
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      ...patch,
    };
    const qs = buildQueryString(next);
    startTransition(() => router.push(`${pathname}${qs}`, { scroll: false }));
  }

  function toggleCategory(value) {
    const next = category.includes(value) ? category.filter((c) => c !== value) : [...category, value];
    updateParams({ category: next });
  }

  function toggleRating(value) {
    updateParams({ minRating: minRating === value ? "" : value });
  }

  function clearAll() {
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  const sortSelect = (
    <Select
      value={sort}
      onChange={(e) => updateParams({ sort: e.target.value })}
      className="w-auto h-10"
    >
      {SORT_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </Select>
  );

  const filterControls = (
    <div className="flex flex-wrap items-center gap-3">
      <MultiSelectDropdown
        label="Location"
        options={options.locations}
        selected={location}
        onChange={(next) => updateParams({ location: next })}
      />
      {options.categories.map((cat) => (
        <Chip key={cat} active={category.includes(cat)} onClick={() => toggleCategory(cat)}>
          {cat}
        </Chip>
      ))}
      {RATING_OPTIONS.map((r) => (
        <Chip key={r.value} active={minRating === r.value} onClick={() => toggleRating(r.value)}>
          ★ {r.label}
        </Chip>
      ))}
      <MultiSelectDropdown
        label="Amenities"
        options={options.amenities}
        selected={amenities}
        onChange={(next) => updateParams({ amenities: next })}
      />
      <div className="w-full sm:w-56">
        <RangeSlider
          min={options.priceMin}
          max={options.priceMax}
          value={[minPrice, maxPrice]}
          formatValue={formatINR}
          onChange={([lo, hi]) => updateParams({ minPrice: lo, maxPrice: hi })}
        />
      </div>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" /> Clear all
        </button>
      )}
    </div>
  );

  return (
    <div className={cn("mb-8 transition-opacity", isPending && "opacity-60")}>
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
        {filterControls}
        {sortSelect}
      </div>

      <div className="flex md:hidden items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <div className="flex-1">{sortSelect}</div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="flex flex-col gap-4">{filterControls}</div>
      </FilterDrawer>
    </div>
  );
}
