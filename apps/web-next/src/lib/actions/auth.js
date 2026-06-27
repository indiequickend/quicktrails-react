"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { createSession, deleteSession } from "@/lib/session";

export async function login(state, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  await dbConnect();
  const user = await User.findOne({ email, role: "admin" });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({ userId: user._id.toString(), role: user.role });
  redirect("/waypoint");
}

export async function logout() {
  await deleteSession();
  redirect("/waypoint/login");
}
