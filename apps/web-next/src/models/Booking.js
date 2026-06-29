import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary", default: null },
    bookingType: { type: String, enum: ["property", "package", "general", "self_plan"], default: "general" },
    guestName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    roomType: { type: String, default: "" },
    numberOfTravelers: { type: Number, default: 1 },
    preferredDates: { type: String, default: "" },
    specialRequests: { type: String, default: "" },
    // Self-plan inquiry fields (only populated when bookingType === "self_plan")
    destinations: [{ type: String }],
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    adults: { type: Number, default: null },
    childrenUnder8: { type: Number, default: 0 },
    stayPreference: { type: String, enum: ["budget", "standard", "premium", ""], default: "" },
    budgetPerNight: { type: Number, default: null },
    rooms: [{
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      ac: { type: Boolean, default: true },
    }],
    foodPreference: {
      veg: { type: Number, default: 0 },
      nonVeg: { type: Number, default: 0 },
    },
    stayBudget: {
      amount: { type: Number, default: null },
      type: { type: String, enum: ['per_night', 'per_head_per_day', ''], default: '' },
    },
    carType: { type: String, default: "" },
    carAC: { type: Boolean, default: true },
    numberOfCars: { type: Number, default: 1 },
    discountSnapshot: {
      type: { type: String, enum: ["percentage", "fixed", "none"], default: "none" },
      value: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
