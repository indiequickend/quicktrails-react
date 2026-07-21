"use client";

import { useEffect, useState } from "react";

const THUMB_CLASSES =
  "absolute w-full appearance-none bg-transparent pointer-events-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background";

// Dual-thumb range built from two overlaid native <input type="range">
// elements -- avoids pulling in a slider dependency for one control.
export function RangeSlider({ min, max, value, onChange, formatValue = (v) => v }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value[0], value[1]]);

  const [lo, hi] = local;
  const commit = () => onChange(local);

  function handleLo(e) {
    setLocal([Math.min(Number(e.target.value), hi - 1), hi]);
  }
  function handleHi(e) {
    setLocal([lo, Math.max(Number(e.target.value), lo + 1)]);
  }

  const loPct = max > min ? ((lo - min) / (max - min)) * 100 : 0;
  const hiPct = max > min ? ((hi - min) / (max - min)) * 100 : 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>{formatValue(lo)}</span>
        <span>{formatValue(hi)}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={lo}
          onChange={handleLo}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          className={THUMB_CLASSES}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={hi}
          onChange={handleHi}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          className={THUMB_CLASSES}
        />
      </div>
    </div>
  );
}
