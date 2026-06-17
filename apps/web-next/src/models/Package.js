import mongoose from "mongoose";

const ItineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    destination: { type: String, required: true, trim: true },
    duration: { type: Number, required: true }, // days
    description: { type: String, default: "" },
    heroImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    itinerary: { type: [ItineraryDaySchema], default: [] },
    includedAmenities: { type: [String], default: [] },
    price: { type: Number, required: true },
    highlights: { type: [String], default: [] },
    relatedPackages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
  },
  { timestamps: true }
);

PackageSchema.index({ destination: 1 });

export default mongoose.models.Package || mongoose.model("Package", PackageSchema);
