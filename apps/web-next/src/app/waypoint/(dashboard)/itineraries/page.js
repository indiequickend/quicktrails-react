'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getItineraries, duplicateItinerary, deleteItinerary } from '@/lib/actions/itineraries';

export default function ItinerariesPage() {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isDuplicating, setIsDuplicating] = useState(null);

    const fetchItineraries = async () => {
        setIsLoading(true);
        const data = await getItineraries(page, 10, search);
        if (data.success) {
            setItems(data.items);
            setTotalPages(data.totalPages);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchItineraries(); }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleDuplicate = async (id) => {
        setIsDuplicating(id);
        const res = await duplicateItinerary(id);
        if (res.success) await fetchItineraries();
        else alert('Failed to duplicate itinerary.');
        setIsDuplicating(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this itinerary? This cannot be undone.')) return;
        setIsLoading(true);
        const res = await deleteItinerary(id);
        if (res.success) await fetchItineraries();
        else { alert('Failed to delete itinerary.'); setIsLoading(false); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Itineraries</h1>
                <Link
                    href="/waypoint/itineraries/builder"
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition shadow-sm"
                >
                    + Create New
                </Link>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border bg-muted">
                    <input
                        type="text"
                        placeholder="Search by trip title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full max-w-md p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Trip Title</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Duration</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Price</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No itineraries found.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/40 transition">
                                    <td className="px-4 py-3 font-medium">
                                        <button onClick={() => router.push(`/waypoint/itineraries/builder?id=${item._id}`)} className="hover:text-primary transition text-left">
                                            {item.tripTitle}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.durationText}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.totalPrice || '-'}</td>
                                    <td className="px-4 py-3">
                                        {item.b2bDetails?.isB2B ? (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 text-xs">B2B: {item.b2bDetails.agencyName}</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100 text-xs">Direct</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'FINALIZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            onClick={() => handleDuplicate(item._id)}
                                            disabled={isDuplicating === item._id}
                                            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                                        >
                                            {isDuplicating === item._id ? 'Copying...' : 'Duplicate'}
                                        </button>
                                        <button
                                            onClick={() => router.push(`/waypoint/itineraries/builder?id=${item._id}`)}
                                            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-xs text-destructive hover:opacity-80 font-medium"
                                        >
                                            Delete
                                        </button>
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
