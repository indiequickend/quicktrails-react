import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-muted">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
