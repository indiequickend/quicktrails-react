'use client';

import { useItineraryStore } from '@/store/useItineraryStore';
import SimpleUploadButton from '@/components/admin/SimpleUploadButton';

export default function B2BPanel() {
    const { b2bDetails, setB2bDetails } = useItineraryStore();

    const handleToggle = () => {
        setB2bDetails({ ...b2bDetails, isB2B: !b2bDetails.isB2B });
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-2">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-serif font-semibold text-gray-900">B2B White-Labeling</h3>
                    <p className="text-xs text-gray-500">Generate for a partner agency.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={b2bDetails.isB2B} onChange={handleToggle} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-600 transition-all after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
            </div>

            {b2bDetails.isB2B && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Partner Agency Name</label>
                        <input
                            type="text"
                            value={b2bDetails.agencyName}
                            onChange={(e) => setB2bDetails({ ...b2bDetails, agencyName: e.target.value })}
                            className="mt-1 w-full p-2 text-xs border border-gray-300 rounded focus:ring-amber-500 outline-none"
                            placeholder="e.g., Global Escapes"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Agency Logo</label>
                        <SimpleUploadButton
                            label="Upload Partner Logo"
                            onUpload={(url) => setB2bDetails({ ...b2bDetails, logoUrl: url })}
                            className="text-xs py-1.5"
                        />
                        {b2bDetails.logoUrl && (
                            <img src={b2bDetails.logoUrl} alt="Partner Logo" className="mt-2 h-10 object-contain" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
