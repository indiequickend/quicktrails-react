import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { verifyAdminSession } from "@/lib/dal";
import { deleteProperty } from "@/lib/actions/properties";
import { getProperties } from "@/lib/data";
import { Button } from "@/components/ui/Button";

export default async function AdminPropertiesPage() {
  await verifyAdminSession();
  const properties = await getProperties();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Button href="/admin/properties/new">
          <Plus className="w-4 h-4" /> New property
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property._id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{property.name}</td>
                <td className="px-4 py-3">{property.location}</td>
                <td className="px-4 py-3">{property.category}</td>
                <td className="px-4 py-3">{property.rating || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/properties/${property._id}/edit`} className="p-2 hover:bg-muted rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <form action={deleteProperty}>
                      <input type="hidden" name="id" value={property._id} />
                      <button type="submit" className="p-2 hover:bg-muted rounded-lg text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No properties yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
