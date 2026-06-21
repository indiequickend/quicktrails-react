"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions/booking";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function BookingForm({ propertySlug, packageSlug, roomTypes = [] }) {
  const [state, formAction, pending] = useActionState(createBooking, undefined);

  if (state?.success) {
    return (
      <p className="text-center text-primary font-medium py-8">
        Thanks! We&apos;ll contact you within 24 hours to confirm availability.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {propertySlug && <input type="hidden" name="propertySlug" value={propertySlug} />}
      {packageSlug && <input type="hidden" name="packageSlug" value={packageSlug} />}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div>
        <Label htmlFor="guestName">Name *</Label>
        <Input id="guestName" name="guestName" required placeholder="Your full name" />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required placeholder="your.email@example.com" />
      </div>
      <div>
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" />
      </div>
      {roomTypes.length > 1 && (
        <div>
          <Label htmlFor="roomType">Room type</Label>
          <Select id="roomType" name="roomType">
            <option value="">Select a room type</option>
            {roomTypes.map((rt) => (
              <option key={rt.type} value={rt.type}>{rt.type}</option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="numberOfTravelers">Number of travelers</Label>
        <Input id="numberOfTravelers" name="numberOfTravelers" type="number" min="1" defaultValue={1} />
      </div>
      <div>
        <Label htmlFor="preferredDates">Preferred dates</Label>
        <Input id="preferredDates" name="preferredDates" placeholder="e.g., June 15-22, 2026" />
      </div>
      <div>
        <Label htmlFor="specialRequests">Special requests</Label>
        <Textarea id="specialRequests" name="specialRequests" rows={3} placeholder="Any special requirements..." />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting..." : "Submit inquiry"}
      </Button>
    </form>
  );
}
