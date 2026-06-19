import { verifyAdminSession } from "@/lib/dal";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { Select } from "@/components/ui/Input";

const STATUSES = ["new", "contacted", "confirmed", "cancelled"];

export default async function AdminBookingsPage() {
  await verifyAdminSession();
  await dbConnect();

  const bookings = await Booking.find()
    .sort("-createdAt")
    .populate("property", "name")
    .populate("package", "tripTitle")
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings &amp; enquiries</h1>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">For</th>
              <th className="px-4 py-3">Travelers</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id.toString()} className="border-t border-border align-top">
                <td className="px-4 py-3 font-medium">{b.guestName}</td>
                <td className="px-4 py-3">
                  <div>{b.email}</div>
                  <div className="text-muted-foreground">{b.phone}</div>
                </td>
                <td className="px-4 py-3">{b.property?.name || b.package?.tripTitle || "General enquiry"}</td>
                <td className="px-4 py-3">{b.numberOfTravelers}</td>
                <td className="px-4 py-3">{b.preferredDates || "-"}</td>
                <td className="px-4 py-3">
                  <form action={updateBookingStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={b._id.toString()} />
                    <Select name="status" defaultValue={b.status} className="h-9 text-sm">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                    <button type="submit" className="text-primary text-sm font-medium hover:underline">
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
