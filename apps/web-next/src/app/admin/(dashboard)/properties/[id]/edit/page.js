import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/dal";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function EditPropertyPage({ params }) {
  await verifyAdminSession();
  const { id } = await params;

  await dbConnect();
  const property = await Property.findById(id).lean();
  if (!property) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit property</h1>
      <PropertyForm property={JSON.parse(JSON.stringify(property))} />
    </div>
  );
}
