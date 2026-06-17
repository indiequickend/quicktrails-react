import { Building2, Package as PackageIcon, Inbox } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Package from "@/models/Package";
import Booking from "@/models/Booking";
import { verifyAdminSession } from "@/lib/dal";

export default async function AdminDashboardPage() {
  await verifyAdminSession();
  await dbConnect();

  const [propertyCount, packageCount, newBookingCount] = await Promise.all([
    Property.countDocuments(),
    Package.countDocuments(),
    Booking.countDocuments({ status: "new" }),
  ]);

  const stats = [
    { label: "Properties", value: propertyCount, icon: Building2 },
    { label: "Tour packages", value: packageCount, icon: PackageIcon },
    { label: "New enquiries", value: newBookingCount, icon: Inbox },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
