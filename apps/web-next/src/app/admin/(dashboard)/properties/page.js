'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAdminProperties, deleteProperty } from '@/lib/actions/properties';

export default function AdminPropertiesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await getAdminProperties(page, 20, search);
      if (!cancelled && data.success) {
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
      if (!cancelled) setIsLoading(false);
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, page, refreshKey]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    const formData = new FormData();
    formData.set('id', id);
    setIsLoading(true);
    await deleteProperty(formData);
    setRefreshKey(k => k + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New property
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-md p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-ring bg-background"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {total} {total === 1 ? 'property' : 'properties'}
          </span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? `No properties matching "${search}".` : 'No properties yet.'}
                </td>
              </tr>
            ) : items.map((property) => (
              <tr key={property._id} className="border-t border-border hover:bg-muted/40 transition">
                <td className="px-4 py-3 font-medium">{property.name}</td>
                <td className="px-4 py-3">{property.location}</td>
                <td className="px-4 py-3">{property.category}</td>
                <td className="px-4 py-3">{property.rating || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/properties/${property._id}/edit`} className="p-2 hover:bg-muted rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="p-2 hover:bg-muted rounded-lg text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-border rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-border rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
