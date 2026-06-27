"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, Upload, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImageUploader({ name, initialImages = [], multiple = true, onChange }) {
  const [images, setImagesState] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function setImages(next) {
    setImagesState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      onChange?.(resolved);
      return resolved;
    });
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/waypoint/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        uploaded.push(await res.json());
      }
      setImages((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    } catch {
      setError("One or more uploads failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(publicId) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  function handleDragStart(idx) {
    dragIndex.current = idx;
  }

  function handleDragOver(e, idx) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === idx) return;
    setDragOverIndex(idx);
  }

  function handleDrop(idx) {
    const from = dragIndex.current;
    if (from === null || from === idx) {
      dragIndex.current = null;
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragIndex.current = null;
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDragOverIndex(null);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img, idx) => (
            <div
              key={img.publicId}
              draggable={multiple}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative w-24 h-24 rounded-lg overflow-hidden border border-border transition-all duration-150 select-none",
                multiple && "cursor-grab active:cursor-grabbing",
                dragIndex.current === idx && "opacity-40 scale-95",
                dragOverIndex === idx && dragIndex.current !== idx && "ring-2 ring-primary scale-105"
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover pointer-events-none" />
              {multiple && (
                <div className="absolute bottom-1 left-1 bg-black/50 rounded p-0.5 text-white">
                  <GripVertical className="w-3 h-3" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.publicId)}
                className="absolute top-1 right-1 bg-slate-950/70 text-white rounded-full p-1"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input cursor-pointer hover:bg-muted text-sm">
        <Upload className="w-4 h-4" />
        {uploading ? "Uploading..." : "Upload image" + (multiple ? "s" : "")}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
      </label>

      {multiple && images.length > 1 && (
        <p className="text-xs text-muted-foreground mt-2">Drag thumbnails to reorder. First image is the cover.</p>
      )}

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
