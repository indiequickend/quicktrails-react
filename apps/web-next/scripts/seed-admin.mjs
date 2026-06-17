#!/usr/bin/env node
// One-off script to create (or reset the password of) the admin user.
// Usage: node scripts/seed-admin.mjs admin@quicktrails.com "StrongPassword123"
//
// Requires MONGODB_URI to be set in the environment (e.g. via `.env.local`,
// loaded automatically if you run with `node --env-file=.env.local`).

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [, , email, password, name = "Admin"] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password> ["Name"]');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ["admin", "customer"], default: "admin" },
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    { name, email: normalizedEmail, passwordHash, role: "admin" },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Admin user ready: ${user.email} (id ${user._id})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
