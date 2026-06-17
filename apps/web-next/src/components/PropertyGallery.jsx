"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// All slides render in the DOM up front (just translated off-screen via
// CSS), not mounted/unmounted on navigation -- so every property photo is
// still present in the server-rendered HTML for image search/AI crawlers,
// even though only one is visible at a time client-side.
export default function PropertyGallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  const count = images.length;
  const goTo = (i) => setIndex((i + count) % count);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }

  return (
    <div className="mb-12">
      <div
        className="relative h-72 sm:h-96 md:h-[34rem] rounded-3xl overflow-hidden bg-muted outline-none shadow-2xl ring-1 ring-black/5 group"
        tabIndex={0}
        role="group"
        aria-label={`${name} photos`}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative h-full w-full flex-shrink-0 overflow-hidden">
              <Image
                src={img.url}
                alt={img.alt || `${name} - photo ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 1024px"
                className={cn("object-cover", idx === index && "animate-gallery-zoom")}
              />
            </div>
          ))}
        </div>

        {/* Permanent soft scrim so controls stay legible over any photo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-black/25 backdrop-blur-sm">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === index ? "w-7 bg-white shadow-sm" : "w-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>

            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
              {index + 1} / {count}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="relative mt-4">
          <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:thin]">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={cn(
                  "relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden ring-2 transition-all duration-200",
                  idx === index
                    ? "ring-primary shadow-md scale-[1.02]"
                    : "ring-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]"
                )}
              >
                <Image src={img.url} alt="" fill sizes="112px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
