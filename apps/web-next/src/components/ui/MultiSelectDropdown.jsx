"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200",
          selected.length > 0
            ? "bg-primary/10 text-primary border-primary"
            : "bg-background text-foreground border-border hover:bg-muted"
        )}
      >
        {label}
        {selected.length > 0 && <span className="text-xs">({selected.length})</span>}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg p-2">
          {options.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1.5">No options available.</p>
          )}
          {options.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const text = typeof opt === "string" ? opt : opt.label;
            return (
              <label
                key={value}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(value)}
                  onChange={() => toggle(value)}
                  className="accent-primary"
                />
                {text}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
