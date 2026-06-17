"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
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

function parseImages(formData) {
  const raw = String(formData.get("imagesJson") || "[]");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const VALID_PRICE_UNITS = ["night", "person_per_day"];

function parseRoomTypes(formData) {
  const raw = String(formData.get("roomTypesJson") || "[]");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.map((rt) => ({
    type: String(rt.type || ""),
    description: String(rt.description || ""),
    price: Number(rt.price) || 0,
    priceUnit: VALID_PRICE_UNITS.includes(rt.priceUnit) ? rt.priceUnit : "night",
  }));
}

export async function saveProperty(prevState, formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get("id");
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim();

  if (!name || !location) {
    return { error: "Name and location are required." };
  }

  const data = {
    name,
    location,
    category: String(formData.get("category") || "Hotel"),
    description: String(formData.get("description") || ""),
    rating: Number(formData.get("rating")) || 0,
    amenities: parseListField(formData, "amenities"),
    images: parseImages(formData),
    roomTypes: parseRoomTypes(formData),
  };

  let slug = String(formData.get("slug") || "").trim();
  slug = slug ? slugify(slug) : slugify(name);
  data.slug = slug;

  if (id) {
    await Property.findByIdAndUpdate(id, data);
  } else {
    await Property.create(data);
  }

  revalidatePath("/properties");
  revalidatePath(`/property/${slug}`);
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

export async function deleteProperty(formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get("id");
  const property = await Property.findById(id);
  if (property) {
    await Promise.all((property.images || []).map((img) => deleteImage(img.publicId)));
    await Property.findByIdAndDelete(id);
  }

  revalidatePath("/properties");
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}
