"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";

// Uploads directly to our /api/admin/upload route (which forwards to
// Cloudinary server-side, keeping the API secret off the client) and keeps
// the resulting [{ url, publicId }] list in a hidden input so it submits
// along with the rest of the form.
export default function ImageUploader({ name, initialImages = [], multiple = true, onChange }) {
  const [images, setImagesState] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const result = await res.json();
        uploaded.push(result);
      }
      setImages((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    } catch (err) {
      setError("One or more uploads failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(publicId) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img) => (
          <div key={img.publicId} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
            <Image src={img.url} alt="" fill className="object-cover" />
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

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
