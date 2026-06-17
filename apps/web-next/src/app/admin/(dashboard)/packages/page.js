import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { verifyAdminSession } from "@/lib/dal";
import { deletePackage } from "@/lib/actions/packages";
import { getPackages } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";

export default async function AdminPackagesPage() {
  await verifyAdminSession();
  const packages = await getPackages();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tour packages</h1>
        <Button href="/admin/packages/new">
          <Plus className="w-4 h-4" /> New package
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg._id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{pkg.name}</td>
                <td className="px-4 py-3">{pkg.destination}</td>
                <td className="px-4 py-3">{pkg.duration} days</td>
                <td className="px-4 py-3">{formatINR(pkg.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/packages/${pkg._id}/edit`} className="p-2 hover:bg-muted rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <form action={deletePackage}>
                      <input type="hidden" name="id" value={pkg._id} />
                      <button type="submit" className="p-2 hover:bg-muted rounded-lg text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No packages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
