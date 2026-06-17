"use server";

import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import Package from "@/models/Package";

export async function createBooking(prevState, formData) {
  const guestName = String(formData.get("guestName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!guestName || !email || !phone) {
    return { error: "Please fill in your name, email and phone number." };
  }

  await dbConnect();

  const propertySlug = formData.get("propertySlug");
  const packageSlug = formData.get("packageSlug");

  let property = null;
  let pkg = null;
  let bookingType = "general";

  if (propertySlug) {
    property = await Property.findOne({ slug: propertySlug }).select("_id").lean();
    bookingType = "property";
  } else if (packageSlug) {
    pkg = await Package.findOne({ slug: packageSlug }).select("_id").lean();
    bookingType = "package";
  }

  await Booking.create({
    property: property?._id || null,
    package: pkg?._id || null,
    bookingType,
    guestName,
    email,
    phone,
    numberOfTravelers: Number(formData.get("numberOfTravelers")) || 1,
    preferredDates: String(formData.get("preferredDates") || ""),
    specialRequests: String(formData.get("specialRequests") || ""),
  });

  return { success: true };
}
