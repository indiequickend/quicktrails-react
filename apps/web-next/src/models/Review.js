import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", default: null },
    guestName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ property: 1 });
ReviewSchema.index({ package: 1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
