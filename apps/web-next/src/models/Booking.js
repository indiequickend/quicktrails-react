import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", default: null },
    bookingType: { type: String, enum: ["property", "package", "general"], default: "general" },
    guestName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    numberOfTravelers: { type: Number, default: 1 },
    preferredDates: { type: String, default: "" },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
