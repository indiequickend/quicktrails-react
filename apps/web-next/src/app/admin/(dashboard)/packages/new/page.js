import { verifyAdminSession } from "@/lib/dal";
import PackageForm from "@/components/admin/PackageForm";

export default async function NewPackagePage() {
  await verifyAdminSession();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New package</h1>
      <PackageForm />
    </div>
  );
}
