import { Fragment } from "react";
import { verifyAdminSession } from "@/lib/dal";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { Select } from "@/components/ui/Input";

const STATUSES = ["new", "contacted", "confirmed", "cancelled"];

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SelfPlanDetail({ b }) {
  const nights = b.startDate && b.endDate
    ? Math.round((new Date(b.endDate) - new Date(b.startDate)) / 86400000)
    : null;

  return (
    <tr className="border-t border-dashed border-border bg-violet-50/50">
      <td colSpan={6} className="px-4 py-3">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600 max-w-2xl">
          {b.destinations?.length > 0 && (
            <div><span className="font-medium text-slate-700">Destinations:</span> {b.destinations.join(' → ')}</div>
          )}
          {b.startDate && (
            <div><span className="font-medium text-slate-700">Dates:</span> {formatDate(b.startDate)} – {formatDate(b.endDate)}{nights ? ` (${nights} nights)` : ''}</div>
          )}
          {b.adults != null && (
            <div><span className="font-medium text-slate-700">Group:</span> {b.adults} adult{b.adults !== 1 ? 's' : ''}{b.childrenUnder8 ? `, ${b.childrenUnder8} child${b.childrenUnder8 !== 1 ? 'ren' : ''} <8` : ''}</div>
          )}
          {b.stayPreference && (
            <div><span className="font-medium text-slate-700">Stay:</span> {b.stayPreference.charAt(0).toUpperCase() + b.stayPreference.slice(1)}{b.budgetPerNight ? ` · ₹${b.budgetPerNight.toLocaleString('en-IN')}/night budget` : ''}</div>
          )}
          {b.stayBudget?.amount > 0 && (
            <div>
              <span className="font-medium text-slate-700">Stay budget:</span>{' '}
              ₹{b.stayBudget.amount.toLocaleString('en-IN')} {b.stayBudget.type === 'per_head_per_day' ? 'per head/day' : 'per night'}
            </div>
          )}
          {b.rooms?.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium text-slate-700">Rooms:</span>{' '}
              {b.rooms.map((r, i) => `Room ${i + 1}: ${r.adults}A${r.children ? `+${r.children}C` : ''} · ${r.ac ? 'AC' : 'Non-AC'}`).join(' · ')}
            </div>
          )}
          {(b.foodPreference?.veg > 0 || b.foodPreference?.nonVeg > 0) && (
            <div><span className="font-medium text-slate-700">Food:</span> Veg {b.foodPreference.veg}, Non-veg {b.foodPreference.nonVeg}</div>
          )}
          {b.carType && (
            <div><span className="font-medium text-slate-700">Vehicle:</span> {b.carType} × {b.numberOfCars || 1} ({b.carAC ? 'AC' : 'Non-AC'})</div>
          )}
          {b.discountSnapshot?.type !== 'none' && b.discountSnapshot?.value > 0 && (
            <div className="text-violet-700">
              <span className="font-medium">Discount promised:</span>{' '}
              {b.discountSnapshot.type === 'percentage' ? `${b.discountSnapshot.value}% off` : `₹${b.discountSnapshot.value.toLocaleString('en-IN')} off`}
            </div>
          )}
          {b.specialRequests && (
            <div className="col-span-2"><span className="font-medium text-slate-700">Notes:</span> {b.specialRequests}</div>
          )}
        </div>
      </td>
    </tr>
  );
}

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
              <Fragment key={b._id.toString()}>
                <tr className="border-t border-border align-top">
                  <td className="px-4 py-3 font-medium">{b.guestName}</td>
                  <td className="px-4 py-3">
                    <div>{b.email}</div>
                    <div className="text-muted-foreground">{b.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {b.bookingType === 'self_plan' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                        Self-planned trip
                      </span>
                    ) : (
                      b.property?.name || b.package?.tripTitle || 'General enquiry'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.bookingType === 'self_plan' && b.adults != null
                      ? `${b.adults}A${b.childrenUnder8 ? `+${b.childrenUnder8}C` : ''}`
                      : b.numberOfTravelers}
                  </td>
                  <td className="px-4 py-3">
                    {b.bookingType === 'self_plan' && b.startDate
                      ? `${formatDate(b.startDate)} – ${formatDate(b.endDate)}`
                      : (b.preferredDates || '-')}
                  </td>
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
                {b.bookingType === 'self_plan' && <SelfPlanDetail b={b} />}
              </Fragment>
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
