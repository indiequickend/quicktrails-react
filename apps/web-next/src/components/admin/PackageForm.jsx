"use client";

import { useActionState, useState } from "react";
import { savePackage } from "@/lib/actions/packages";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { Plus, Trash2 } from "lucide-react";

export default function PackageForm({ pkg }) {
  const [state, formAction, pending] = useActionState(savePackage, undefined);
  const [itinerary, setItinerary] = useState(
    pkg?.itinerary?.length ? pkg.itinerary : [{ day: 1, title: "", description: "" }]
  );
  const [heroImage, setHeroImage] = useState(pkg?.heroImage?.url ? [pkg.heroImage] : []);

  function updateDay(idx, field, value) {
    setItinerary((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }

  function addDay() {
    setItinerary((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }]);
  }

  function removeDay(idx) {
    setItinerary((prev) => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {pkg?._id && <input type="hidden" name="id" value={pkg._id} />}
      <input
        type="hidden"
        name="itineraryJson"
        value={JSON.stringify(itinerary.filter((d) => d.title).map((d) => ({ ...d, day: Number(d.day) })))}
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={pkg?.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (optional, auto from name)</Label>
          <Input id="slug" name="slug" defaultValue={pkg?.slug} placeholder="auto-generated" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="destination">Destination *</Label>
          <Input id="destination" name="destination" defaultValue={pkg?.destination} required />
        </div>
        <div>
          <Label htmlFor="duration">Duration (days) *</Label>
          <Input id="duration" name="duration" type="number" min="1" defaultValue={pkg?.duration} required />
        </div>
        <div>
          <Label htmlFor="price">Price per person (INR) *</Label>
          <Input id="price" name="price" type="number" min="0" defaultValue={pkg?.price} required />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={pkg?.description} />
      </div>

      <div>
        <Label htmlFor="highlights">Highlights (comma separated)</Label>
        <Input id="highlights" name="highlights" defaultValue={(pkg?.highlights || []).join(", ")} />
      </div>

      <div>
        <Label htmlFor="includedAmenities">What&apos;s included (comma separated)</Label>
        <Input id="includedAmenities" name="includedAmenities" defaultValue={(pkg?.includedAmenities || []).join(", ")} />
      </div>

      <div>
        <Label>Day-by-day itinerary</Label>
        <div className="space-y-3">
          {itinerary.map((d, idx) => (
            <div key={idx} className="grid grid-cols-[3rem_1fr_2fr_auto] gap-2 items-start">
              <Input value={d.day} readOnly className="text-center" />
              <Input placeholder="Title" value={d.title} onChange={(e) => updateDay(idx, "title", e.target.value)} />
              <Input placeholder="Description" value={d.description} onChange={(e) => updateDay(idx, "description", e.target.value)} />
              <button type="button" onClick={() => removeDay(idx)} className="p-2 text-destructive hover:bg-muted rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addDay}>
            <Plus className="w-4 h-4" /> Add day
          </Button>
        </div>
      </div>

      <div>
        <Label>Hero image</Label>
        <input
          type="hidden"
          name="heroImageJson"
          value={JSON.stringify(heroImage[0] || { url: "", publicId: "" })}
        />
        <ImageUploader name="__heroImageDisplay" initialImages={heroImage} multiple={false} onChange={setHeroImage} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save package"}
      </Button>
    </form>
  );
}
