'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Globe, GlobeLock } from 'lucide-react';
import { getAdminDestinations, deleteDestination } from '@/lib/actions/destinations';

export default function AdminDestinationsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const data = await getAdminDestinations();
      if (!cancelled && data.success) setItems(data.items);
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete destination "${name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set('id', id);
    setIsLoading(true);
    await deleteDestination(fd);
    setRefreshKey(k => k + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Destinations</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} destination{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/waypoint/destinations/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New destination
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No destinations yet. Create your first one to build SEO landing pages.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Focus Keyword</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{item.name}</td>
                  <td className="px-5 py-3 text-muted-foreground font-mono text-xs">/destination/{item.slug}</td>
                  <td className="px-5 py-3 text-muted-foreground">{item.focusKeyword || '—'}</td>
                  <td className="px-5 py-3">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <Globe className="w-3 h-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        <GlobeLock className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/waypoint/destinations/${item._id}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
