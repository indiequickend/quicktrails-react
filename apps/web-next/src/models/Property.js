import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const RoomTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    // "night": flat price per room per night.
    // "person_per_day": price per head, charged per day (common for
    // homestays/dorms that bill by occupancy rather than by room).
    priceUnit: { type: String, enum: ["night", "person_per_day"], default: "night" },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Hotel", "Homestay", "Resort", "Villa", "Guesthouse"],
      default: "Hotel",
    },
    description: { type: String, default: "" },
    images: { type: [ImageSchema], default: [] },
    amenities: { type: [String], default: [] },
    roomTypes: { type: [RoomTypeSchema], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

PropertySchema.index({ location: 1 });
PropertySchema.index({ category: 1 });

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
