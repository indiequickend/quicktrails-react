"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { Select } from "@/components/ui/Input";
import { FilterDrawer } from "@/components/FilterDrawer";
import { parseListParam, buildQueryString } from "@/lib/searchParamsUtil";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "duration_asc", label: "Duration: Short to Long" },
  { value: "duration_desc", label: "Duration: Long to Short" },
];

export function PackageFilterBar({ options }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const destinations = parseListParam(searchParams.get("destinations"));
  const duration = searchParams.get("duration") || "";
  const sort = searchParams.get("sort") || "newest";

  const activeCount = destinations.length + (duration ? 1 : 0);

  function updateParams(patch) {
    const next = { destinations, duration, sort, ...patch };
    const qs = buildQueryString(next);
    startTransition(() => router.push(`${pathname}${qs}`, { scroll: false }));
  }

  function toggleDuration(value) {
    updateParams({ duration: duration === value ? "" : value });
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
        label="Destination"
        options={options.destinations.map((d) => ({ value: d.slug, label: d.name }))}
        selected={destinations}
        onChange={(next) => updateParams({ destinations: next })}
      />
      {options.durationBuckets.map((b) => (
        <Chip key={b.value} active={duration === b.value} onClick={() => toggleDuration(b.value)}>
          {b.label}
        </Chip>
      ))}
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
