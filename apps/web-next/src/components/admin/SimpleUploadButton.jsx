"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function SimpleUploadButton({ onUpload, label, className = "" }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/waypoint/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();
            if (result.url) onUpload(result.url);
            else throw new Error("No URL in response");
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    return (
        <div>
            <label className={`inline-flex items-center gap-2 px-4 py-2 border border-border rounded text-sm cursor-pointer hover:bg-muted transition ${uploading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : (label || "Upload Image")}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}
