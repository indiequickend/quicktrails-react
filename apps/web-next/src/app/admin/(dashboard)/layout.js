import Link from "next/link";
import { LayoutDashboard, Building2, Package as PackageIcon, Inbox, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

// Everything under /admin reads the session cookie and hits MongoDB per
// request -- never statically prerender it (also works around a Turbopack
// prerender crash on nested client components using useActionState).
export const dynamic = "force-dynamic";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/packages", label: "Packages", icon: PackageIcon },
  { href: "/admin/bookings", label: "Bookings", icon: Inbox },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-muted">
      <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col">
        <div className="px-6 py-6 text-xl font-bold border-b border-slate-800">QuickTrails Admin</div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="p-3 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
