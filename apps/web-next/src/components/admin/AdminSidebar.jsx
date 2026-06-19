'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, Map, BookOpen, Inbox, Settings2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { logout } from '@/lib/actions/auth';

const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Properties', icon: Building2 },
    { href: '/admin/itineraries', label: 'Itineraries', icon: Map },
    { href: '/admin/catalog', label: 'Catalog', icon: BookOpen },
    { href: '/admin/bookings', label: 'Bookings', icon: Inbox },
    { href: '/admin/brand-settings', label: 'Brand Settings', icon: Settings2 },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const startsCollapsed = pathname?.includes('/itineraries/builder');
    const [collapsed, setCollapsed] = useState(startsCollapsed);

    return (
        <aside className={`${collapsed ? 'w-14' : 'w-64'} bg-slate-950 text-slate-100 flex flex-col shrink-0 transition-all duration-200`}>
            <div className={`flex items-center border-b border-slate-800 h-[60px] ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                {!collapsed && <span className="text-lg font-bold truncate">QuickTrails Admin</span>}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors shrink-0"
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        title={collapsed ? link.label : undefined}
                        className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <link.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="truncate">{link.label}</span>}
                    </Link>
                ))}
            </nav>

            <form action={logout} className="p-2 border-t border-slate-800">
                <button
                    type="submit"
                    title={collapsed ? 'Log out' : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors w-full text-left ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Log out</span>}
                </button>
            </form>
        </aside>
    );
}
