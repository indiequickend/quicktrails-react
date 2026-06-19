"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PropertyGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);
  const lightboxRef = useRef(null);

  if (!images || images.length === 0) return null;

  const count = images.length;
  const goTo = (i) => setActiveIndex((i + count) % count);
  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  function openLightbox(i) {
    setActiveIndex(i);
    setLightboxOpen(true);
    setTimeout(() => lightboxRef.current?.focus(), 0);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "Escape") setLightboxOpen(false);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStartX.current = null;
  }

  return (
    <div className="mb-10">

      {/* ── Hero image ─────────────────────────────────────────── */}
      <div
        className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-muted cursor-pointer group"
        onClick={() => openLightbox(activeIndex)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={activeIndex}
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || `${name} — photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 900px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Subtle bottom scrim */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Photo count badge */}
        {count > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); openLightbox(activeIndex); }}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors"
          >
            <Images className="w-3.5 h-3.5" />
            View all {count} photos
          </button>
        )}

        {/* Prev / next arrows (desktop only) */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ────────────────────────────────────── */}
      {count > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
              className={cn(
                "relative h-16 w-24 md:h-20 md:w-28 flex-shrink-0 rounded-xl overflow-hidden ring-2 transition-all duration-200",
                idx === activeIndex
                  ? "ring-primary shadow-md"
                  : "ring-transparent opacity-55 hover:opacity-90 hover:ring-border"
              )}
            >
              <Image src={img.url} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col outline-none"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <span className="text-white/50 text-sm font-medium">{activeIndex + 1} / {count}</span>
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative min-h-0">
            <Image
              key={activeIndex}
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || `${name} — photo ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 && (
            <>
              <button onClick={prev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="flex gap-2 px-5 py-4 overflow-x-auto shrink-0 [scrollbar-width:none]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden ring-2 transition-all duration-200",
                  idx === activeIndex ? "ring-white" : "ring-transparent opacity-40 hover:opacity-75"
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
