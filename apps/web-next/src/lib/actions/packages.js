"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import { verifyAdminSession } from "@/lib/dal";
import { slugify } from "@/lib/slugify";
import { deleteImage } from "@/lib/cloudinary";

function parseListField(formData, name) {
  const raw = String(formData.get(name) || "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseItinerary(formData) {
  const raw = String(formData.get("itineraryJson") || "[]");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function parseHeroImage(formData) {
  const raw = String(formData.get("heroImageJson") || "null");
  try {
    return JSON.parse(raw) || { url: "", publicId: "" };
  } catch {
    return { url: "", publicId: "" };
  }
}

export async function savePackage(prevState, formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get("id");
  const name = String(formData.get("name") || "").trim();
  const destination = String(formData.get("destination") || "").trim();
  const duration = Number(formData.get("duration"));
  const price = Number(formData.get("price"));

  if (!name || !destination || !duration || !price) {
    return { error: "Name, destination, duration and price are required." };
  }

  const data = {
    name,
    destination,
    duration,
    price,
    description: String(formData.get("description") || ""),
    highlights: parseListField(formData, "highlights"),
    includedAmenities: parseListField(formData, "includedAmenities"),
    itinerary: parseItinerary(formData),
    heroImage: parseHeroImage(formData),
  };

  let slug = String(formData.get("slug") || "").trim();
  slug = slug ? slugify(slug) : slugify(name);
  data.slug = slug;

  if (id) {
    await Package.findByIdAndUpdate(id, data);
  } else {
    await Package.create(data);
  }

  revalidatePath("/tour-packages");
  revalidatePath(`/package/${slug}`);
  revalidatePath("/waypoint/packages");
  redirect("/waypoint/packages");
}

export async function deletePackage(formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get("id");
  const pkg = await Package.findById(id);
  if (pkg?.heroImage?.publicId) {
    await deleteImage(pkg.heroImage.publicId);
  }
  await Package.findByIdAndDelete(id);

  revalidatePath("/tour-packages");
  revalidatePath("/waypoint/packages");
  redirect("/waypoint/packages");
}
