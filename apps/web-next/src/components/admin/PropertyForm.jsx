"use client";

import { useActionState, useState } from "react";
import { saveProperty } from "@/lib/actions/properties";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { Plus, Trash2 } from "lucide-react";
import { PRICE_UNIT_OPTIONS } from "@/lib/utils";

const CATEGORIES = ["Hotel", "Homestay", "Resort", "Villa", "Guesthouse"];

export default function PropertyForm({ property }) {
  const [state, formAction, pending] = useActionState(saveProperty, undefined);
  const [roomTypes, setRoomTypes] = useState(
    property?.roomTypes?.length ? property.roomTypes : [{ type: "", description: "", price: "", priceUnit: "night" }]
  );

  function updateRoomType(idx, field, value) {
    setRoomTypes((prev) => prev.map((rt, i) => (i === idx ? { ...rt, [field]: value } : rt)));
  }

  function addRoomType() {
    setRoomTypes((prev) => [...prev, { type: "", description: "", price: "", priceUnit: "night" }]);
  }

  function removeRoomType(idx) {
    setRoomTypes((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {property?._id && <input type="hidden" name="id" value={property._id} />}
      <input
        type="hidden"
        name="roomTypesJson"
        value={JSON.stringify(
          roomTypes
            .filter((rt) => rt.type && rt.price)
            .map((rt) => ({ ...rt, price: Number(rt.price), priceUnit: rt.priceUnit || "night" }))
        )}
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={property?.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (optional, auto from name)</Label>
          <Input id="slug" name="slug" defaultValue={property?.slug} placeholder="auto-generated" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input id="location" name="location" defaultValue={property?.location} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={property?.category || "Hotel"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="rating">Rating (0-5)</Label>
        <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={property?.rating} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={property?.description} />
      </div>

      <div>
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input id="amenities" name="amenities" defaultValue={(property?.amenities || []).join(", ")} placeholder="WiFi, Pool, Parking" />
      </div>

      <div>
        <Label>Room types</Label>
        <div className="space-y-3">
          {roomTypes.map((rt, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 items-start">
              <Input placeholder="Type" value={rt.type} onChange={(e) => updateRoomType(idx, "type", e.target.value)} />
              <Input placeholder="Description" value={rt.description} onChange={(e) => updateRoomType(idx, "description", e.target.value)} />
              <Input placeholder="Price" type="number" value={rt.price} onChange={(e) => updateRoomType(idx, "price", e.target.value)} />
              <Select
                value={rt.priceUnit || "night"}
                onChange={(e) => updateRoomType(idx, "priceUnit", e.target.value)}
              >
                {PRICE_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <button type="button" onClick={() => removeRoomType(idx)} className="p-2 text-destructive hover:bg-muted rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRoomType}>
            <Plus className="w-4 h-4" /> Add room type
          </Button>
        </div>
      </div>

      <div>
        <Label>Images</Label>
        <ImageUploader name="imagesJson" initialImages={property?.images || []} multiple />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save property"}
      </Button>
    </form>
  );
}
