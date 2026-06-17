import mongoose from "mongoose";

// Single model for both admin (today) and customer accounts (future).
// `role` is what gates access -- when customer registration ships, new
// documents simply get role: "customer" and the rest of the auth/session
// plumbing (lib/session.js, proxy.js) needs no structural changes.
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
