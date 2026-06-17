import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/dal";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import PackageForm from "@/components/admin/PackageForm";

export default async function EditPackagePage({ params }) {
  await verifyAdminSession();
  const { id } = await params;

  await dbConnect();
  const pkg = await Package.findById(id).lean();
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit package</h1>
      <PackageForm pkg={JSON.parse(JSON.stringify(pkg))} />
    </div>
  );
}
