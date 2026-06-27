'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCatalogItem } from '@/lib/actions/catalog';
import SimpleUploadButton from '@/components/admin/SimpleUploadButton';

export default function NewCatalogItem() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: 'ACTIVITY',
        title: '',
        location: '',
        description: '',
        estimatedDuration: '',
        images: [],
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await saveCatalogItem(formData);
        if (res.success) {
            alert('Catalog item saved!');
            router.push('/waypoint/catalog');
        } else {
            alert('Failed to save.');
        }
        setIsSaving(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Add to Master Catalog</h1>
                <button onClick={() => router.push('/waypoint/catalog')} className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Catalog</button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="ACTIVITY">Sightseeing / Activity</option>
                                <option value="TRANSFER">Transport / Transfer</option>
                                <option value="DESTINATION">Destination Overview</option>
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">Note: Accommodation is sourced from Properties.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estimated Duration</label>
                            <input type="text" placeholder="e.g., 2 Hours" value={formData.estimatedDuration} onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input type="text" required placeholder="e.g., Sunrise at Tiger Hill" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Location *</label>
                        <input type="text" required placeholder="e.g., Darjeeling, West Bengal" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea rows={4} placeholder="Write an engaging description for the PDF export..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none resize-none" />
                    </div>

                    <div className="p-4 border border-dashed border-border rounded bg-muted/30">
                        <label className="block text-sm font-medium mb-2">Images</label>
                        <SimpleUploadButton
                            label="Upload Image"
                            onUpload={(url) => setFormData({ ...formData, images: [...formData.images, { url, isHighRes: true }] })}
                        />
                        {formData.images.length > 0 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="relative group">
                                        <img src={img.url} alt="" className="h-20 w-20 object-cover rounded shadow-sm" />
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full py-3 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save to Master Catalog'}
                    </button>
                </form>
            </div>
        </div>
    );
}
