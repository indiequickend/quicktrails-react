"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyAdminSession } from "@/lib/dal";

export async function updateBookingStatus(formData) {
  await verifyAdminSession();
  await dbConnect();

  const id = formData.get("id");
  const status = formData.get("status");

  await Booking.findByIdAndUpdate(id, { status });
  revalidatePath("/admin/bookings");
}
