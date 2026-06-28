import "server-only";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Package from "@/models/Package";
import Itinerary from "@/models/Itinerary";
import Review from "@/models/Review";

// Plain-object helper -- Mongoose documents aren't serializable as-is
// (ObjectId, Date instances) when passed from Server to Client Components.
function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getProperties({ limit, sort = "-rating", location } = {}) {
  await dbConnect();
  const filter = location ? { location: { $regex: location, $options: "i" } } : {};
  let query = Property.find(filter).sort(sort);
  if (limit) query = query.limit(limit);
  const docs = await query.lean();
  return toPlain(docs);
}

export async function getPropertyBySlug(slug) {
  await dbConnect();
  const doc = await Property.findOne({ slug }).lean();
  return doc ? toPlain(doc) : null;
}

export async function getRelatedProperties(property, limit = 4) {
  await dbConnect();
  const docs = await Property.find({
    _id: { $ne: property._id },
    location: property.location,
  })
    .sort("-rating")
    .limit(limit)
    .lean();
  return toPlain(docs);
}

export async function getPackages({ limit, sort = "-createdAt" } = {}) {
  await dbConnect();
  let query = Package.find().sort(sort);
  if (limit) query = query.limit(limit);
  const docs = await query.lean();
  return toPlain(docs);
}

export async function getPackageBySlug(slug) {
  await dbConnect();
  const doc = await Package.findOne({ slug }).populate("relatedPackages").lean();
  return doc ? toPlain(doc) : null;
}

export async function getReviewsForProperty(propertyId, limit = 10) {
  await dbConnect();
  const docs = await Review.find({ property: propertyId }).sort("-createdAt").limit(limit).lean();
  return toPlain(docs);
}

export async function getReviewsForPackage(packageId, limit = 10) {
  await dbConnect();
  const docs = await Review.find({ package: packageId }).sort("-createdAt").limit(limit).lean();
  return toPlain(docs);
}

export async function getAllSlugs() {
  await dbConnect();
  const [properties, packages] = await Promise.all([
    Property.find().select("slug updatedAt").lean(),
    Itinerary.find({ status: "FINALIZED", "b2bDetails.isB2B": { $ne: true }, slug: { $exists: true, $ne: null } })
      .select("slug updatedAt")
      .lean(),
  ]);
  return { properties: toPlain(properties), packages: toPlain(packages) };
}

export async function getDestinationSlugs() {
  await dbConnect();
  const Destination = (await import("@/models/Destination")).default;
  const docs = await Destination.find({ isActive: true }).select("slug updatedAt parentSlug").lean();
  return toPlain(docs);
}
