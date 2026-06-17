#!/usr/bin/env node
// Inserts a couple of sample properties/packages so the site isn't empty
// during local development/verification. Safe to re-run (upserts by slug).
//
// Usage: node --env-file=.env.local scripts/seed-sample-data.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const PropertySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    location: String,
    category: String,
    description: String,
    images: [{ url: String, publicId: String, alt: String }],
    amenities: [String],
    roomTypes: [{ type: { type: String }, description: String, price: Number }],
    rating: Number,
  },
  { timestamps: true }
);

const PackageSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    destination: String,
    duration: Number,
    description: String,
    heroImage: { url: String, publicId: String },
    itinerary: [{ day: Number, title: String, description: String }],
    includedAmenities: [String],
    price: Number,
    highlights: [String],
  },
  { timestamps: true }
);

const sampleImage = (seed) => ({
  url: `https://images.unsplash.com/${seed}?w=1200&q=80`,
  publicId: `sample/${seed}`,
  alt: "",
});

const properties = [
  {
    name: "Goa Beachside Resort",
    slug: "goa-beachside-resort",
    location: "Goa",
    category: "Resort",
    description: "A relaxed beachfront resort with private access to a quiet stretch of sand, an infinity pool, and sunset views over the Arabian Sea.",
    images: [sampleImage("photo-1571003123894-1f0594d2b5d9")],
    amenities: ["WiFi", "Pool", "Parking", "Restaurant"],
    roomTypes: [
      { type: "Deluxe Sea View", description: "King bed, private balcony", price: 6500 },
      { type: "Garden Cottage", description: "Twin beds, garden access", price: 4200 },
    ],
    rating: 4.6,
  },
  {
    name: "Manali Mountain Homestay",
    slug: "manali-mountain-homestay",
    location: "Manali, Himachal Pradesh",
    category: "Homestay",
    description: "A cosy family-run homestay in the hills above Manali, with home-cooked meals and views of the Pir Panjal range.",
    images: [sampleImage("photo-1506905925346-21bda4d32df4")],
    amenities: ["WiFi", "Restaurant", "Parking"],
    roomTypes: [{ type: "Mountain View Room", description: "Queen bed, wood-fire heating", price: 3200 }],
    rating: 4.8,
  },
];

const packages = [
  {
    name: "Kerala Backwaters Escape",
    slug: "kerala-backwaters-escape",
    destination: "Kerala",
    duration: 5,
    description: "A 5-day journey through Kerala's backwaters, tea estates, and beaches -- including an overnight houseboat stay in Alleppey.",
    heroImage: sampleImage("photo-1602216056096-3b40cc0c9944"),
    itinerary: [
      { day: 1, title: "Arrive in Kochi", description: "Explore Fort Kochi and Chinese fishing nets." },
      { day: 2, title: "Munnar tea estates", description: "Drive to Munnar, visit tea plantations." },
      { day: 3, title: "Thekkady wildlife", description: "Periyar wildlife sanctuary boat safari." },
      { day: 4, title: "Alleppey houseboat", description: "Overnight stay on a traditional houseboat." },
      { day: 5, title: "Departure", description: "Transfer to Kochi airport." },
    ],
    includedAmenities: ["Accommodation", "All meals", "Private transport", "Houseboat stay"],
    price: 28500,
    highlights: ["Overnight houseboat", "Tea estate tour", "Wildlife safari"],
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);
  const Package = mongoose.models.Package || mongoose.model("Package", PackageSchema);

  for (const p of properties) {
    await Property.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, returnDocument: "after" });
    console.log(`Property ready: ${p.slug}`);
  }

  for (const p of packages) {
    await Package.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, returnDocument: "after" });
    console.log(`Package ready: ${p.slug}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
