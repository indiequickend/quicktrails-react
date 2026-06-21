"use server";

import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import Itinerary from "@/models/Itinerary";
import { sendEnquiryMail } from "@/lib/mail";

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
  let forLabel = "General enquiry";

  if (propertySlug) {
    property = await Property.findOne({ slug: propertySlug }).select("_id name").lean();
    bookingType = "property";
    forLabel = property?.name ? `Property: ${property.name}` : "Property enquiry";
  } else if (packageSlug) {
    pkg = await Itinerary.findOne({ slug: packageSlug }).select("_id tripTitle").lean();
    bookingType = "package";
    forLabel = pkg?.tripTitle ? `Package: ${pkg.tripTitle}` : "Package enquiry";
  }

  const roomType = String(formData.get("roomType") || "");
  const numberOfTravelers = Number(formData.get("numberOfTravelers")) || 1;
  const preferredDates = String(formData.get("preferredDates") || "");
  const specialRequests = String(formData.get("specialRequests") || "");

  await Booking.create({
    property: property?._id || null,
    package: pkg?._id || null,
    bookingType,
    guestName,
    email,
    phone,
    roomType,
    numberOfTravelers,
    preferredDates,
    specialRequests,
  });

  sendEnquiryMail({ guestName, email, phone, roomType, numberOfTravelers, preferredDates, specialRequests, forLabel })
    .catch((err) => console.error('Enquiry mail failed:', err));

  return { success: true };
}
