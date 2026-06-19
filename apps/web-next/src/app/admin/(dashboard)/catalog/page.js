'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCatalogItemsOnly, deleteCatalogItem } from '@/lib/actions/catalog';

export default function CatalogPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchItems = async () => {
        setIsLoading(true);
        const data = await getCatalogItemsOnly(page, 10, search);
        if (data.success) {
            setItems(data.items);
            setTotalPages(data.totalPages);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchItems(), 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this catalog item?')) return;
        setIsLoading(true);
        const res = await deleteCatalogItem(id);
        if (res.success) fetchItems();
        else { alert('Failed to delete item.'); setIsLoading(false); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Master Catalog</h1>
                <Link href="/admin/catalog/new" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition shadow-sm">+ Add New Item</Link>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border bg-muted">
                    <input type="text" placeholder="Search activities, hotels, destinations..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-md p-2 border border-border rounded text-sm outline-none" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Title</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Location</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Duration</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading catalog...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No items found.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/40 transition">
                                    <td className="px-4 py-3 text-xs font-semibold text-amber-600 uppercase">{item.type}</td>
                                    <td className="px-4 py-3 font-medium">{item.title}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.estimatedDuration || '-'}</td>
                                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                        <Link href={`/admin/catalog/${item._id}/edit`} className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-border transition">Edit</Link>
                                        <button onClick={() => handleDelete(item._id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {page} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-border rounded text-muted-foreground hover:bg-muted disabled:opacity-50">Previous</button>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-border rounded text-muted-foreground hover:bg-muted disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
