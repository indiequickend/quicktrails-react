import LoginForm from "@/components/admin/LoginForm";

// Never statically prerender this -- also avoids a Turbopack prerender
// crash when a page's default export is itself a Client Component using
// useActionState (see src/app/admin/(dashboard)/layout.js for the same note).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">QuickTrails Admin</h1>
        <LoginForm />
      </div>
    </div>
  );
}
