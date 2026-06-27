import { verifyAdminSession } from "@/lib/dal";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  await verifyAdminSession();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New property</h1>
      <PropertyForm />
    </div>
  );
}
