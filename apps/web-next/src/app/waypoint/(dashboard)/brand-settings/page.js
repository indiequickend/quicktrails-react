'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getBrandSettings, updateBrandSettings } from '@/lib/actions/brand-settings';
import SimpleUploadButton from '@/components/admin/SimpleUploadButton';

const TinyMCEEditor = dynamic(() => import('@/components/TinyMCEEditor'), { ssr: false });

export default function BrandSettingsPage() {
    const [settings, setSettings] = useState({
        companyName: 'QuickTrails',
        primaryLogoUrl: '',
        brandColors: { primary: '#1A202C', accent: '#D69E2E' },
        contactInfo: { phone: '', email: '', website: '', address: '' },
        defaultInclusions: [],
        defaultExclusions: [],
        defaultTerms: '',
        defaultWelcomeMessage: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newInclusion, setNewInclusion] = useState('');
    const [newExclusion, setNewExclusion] = useState('');
    const [logoError, setLogoError] = useState('');

    useEffect(() => {
        async function load() {
            const data = await getBrandSettings();
            if (data) {
                setSettings({
                    companyName: data.companyName || '',
                    primaryLogoUrl: data.primaryLogoUrl || '',
                    brandColors: data.brandColors || { primary: '#1A202C', accent: '#D69E2E' },
                    contactInfo: data.contactInfo || { phone: '', email: '', website: '', address: '' },
                    defaultInclusions: data.defaultInclusions || [],
                    defaultExclusions: data.defaultExclusions || [],
                    defaultTerms: data.defaultTerms || '',
                    defaultWelcomeMessage: data.defaultWelcomeMessage || '',
                });
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const handleSave = async () => {
        if (!settings.primaryLogoUrl) {
            setLogoError('Logo is required. Please upload a logo before saving.');
            return;
        }
        setLogoError('');
        setIsSaving(true);
        const res = await updateBrandSettings(settings);
        if (res.success) alert('Brand settings updated successfully!');
        else alert('Failed to update settings.');
        setIsSaving(false);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading brand settings...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Brand Settings</h1>
            <p className="text-muted-foreground mb-8">These settings are applied globally to all itineraries and across the website header and footer.</p>

            <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl space-y-8">

                {/* Identity */}
                <section className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input type="text" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full p-2 border border-border rounded focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Primary Logo <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <SimpleUploadButton
                                label={settings.primaryLogoUrl ? 'Change Logo' : 'Upload Logo'}
                                onUpload={(url) => { setSettings({ ...settings, primaryLogoUrl: url }); setLogoError(''); }}
                            />
                            {settings.primaryLogoUrl && <img src={settings.primaryLogoUrl} className="h-10 object-contain bg-muted p-1 rounded" alt="Brand Logo" />}
                        </div>
                        {logoError && <p className="text-red-500 text-xs mt-2">{logoError}</p>}
                        <p className="text-xs text-muted-foreground mt-1">This logo is displayed in the site header, footer, and itinerary PDFs.</p>
                    </div>
                </section>

                {/* Colors */}
                <section className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                    <div>
                        <label className="block text-sm font-medium mb-2">Primary Brand Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={settings.brandColors.primary} onChange={(e) => setSettings({ ...settings, brandColors: { ...settings.brandColors, primary: e.target.value } })} className="h-10 w-12 p-1 border border-border rounded cursor-pointer" />
                            <span className="text-sm text-muted-foreground font-mono uppercase">{settings.brandColors.primary}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Accent Brand Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={settings.brandColors.accent} onChange={(e) => setSettings({ ...settings, brandColors: { ...settings.brandColors, accent: e.target.value } })} className="h-10 w-12 p-1 border border-border rounded cursor-pointer" />
                            <span className="text-sm text-muted-foreground font-mono uppercase">{settings.brandColors.accent}</span>
                        </div>
                    </div>
                </section>

                {/* Contact Information */}
                <section className="pt-8 border-t border-border">
                    <h2 className="text-sm font-semibold mb-4 text-foreground">Contact Information</h2>
                    <p className="text-xs text-muted-foreground mb-4">The phone number is used for the WhatsApp float button on the site. Include country code, e.g. +919810001234</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">WhatsApp / Phone</label>
                            <input type="tel" value={settings.contactInfo?.phone || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} placeholder="+919810001234" className="w-full p-2 border border-border rounded focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" value={settings.contactInfo?.email || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} placeholder="hello@yoursite.com" className="w-full p-2 border border-border rounded focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Website</label>
                            <input type="url" value={settings.contactInfo?.website || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, website: e.target.value } })} placeholder="https://yoursite.com" className="w-full p-2 border border-border rounded focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input type="text" value={settings.contactInfo?.address || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} placeholder="Street, City, State, PIN" className="w-full p-2 border border-border rounded focus:outline-none" />
                        </div>
                    </div>
                </section>

                {/* Default Inclusions / Exclusions */}
                <section className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Inclusions</label>
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                            {settings.defaultInclusions.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-green-50 text-green-800 text-sm rounded border border-green-100 group">
                                    <div className="flex items-center gap-2 flex-grow mr-2">
                                        <span className="text-green-600 font-bold shrink-0">✓</span>
                                        <input type="text" value={item} onChange={(e) => { const arr = [...settings.defaultInclusions]; arr[idx] = e.target.value; setSettings({ ...settings, defaultInclusions: arr }); }} className="bg-transparent border-none outline-none flex-grow text-sm" />
                                    </div>
                                    <button onClick={() => setSettings({ ...settings, defaultInclusions: settings.defaultInclusions.filter((_, i) => i !== idx) })} className="text-green-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 px-1">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newInclusion.trim()) { setSettings({ ...settings, defaultInclusions: [...settings.defaultInclusions, newInclusion.trim()] }); setNewInclusion(''); } }} placeholder="Add an inclusion..." className="flex-grow p-2 text-sm border border-border rounded focus:outline-none" />
                            <button onClick={() => { if (newInclusion.trim()) { setSettings({ ...settings, defaultInclusions: [...settings.defaultInclusions, newInclusion.trim()] }); setNewInclusion(''); } }} className="px-3 py-2 bg-muted text-foreground text-sm rounded border border-border hover:bg-border">Add</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Exclusions</label>
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                            {settings.defaultExclusions.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-red-50 text-red-800 text-sm rounded border border-red-100 group">
                                    <div className="flex items-center gap-2 flex-grow mr-2">
                                        <span className="text-red-600 font-bold shrink-0">✗</span>
                                        <input type="text" value={item} onChange={(e) => { const arr = [...settings.defaultExclusions]; arr[idx] = e.target.value; setSettings({ ...settings, defaultExclusions: arr }); }} className="bg-transparent border-none outline-none flex-grow text-sm" />
                                    </div>
                                    <button onClick={() => setSettings({ ...settings, defaultExclusions: settings.defaultExclusions.filter((_, i) => i !== idx) })} className="text-red-600 hover:text-red-800 font-bold opacity-0 group-hover:opacity-100 px-1">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newExclusion.trim()) { setSettings({ ...settings, defaultExclusions: [...settings.defaultExclusions, newExclusion.trim()] }); setNewExclusion(''); } }} placeholder="Add an exclusion..." className="flex-grow p-2 text-sm border border-border rounded focus:outline-none" />
                            <button onClick={() => { if (newExclusion.trim()) { setSettings({ ...settings, defaultExclusions: [...settings.defaultExclusions, newExclusion.trim()] }); setNewExclusion(''); } }} className="px-3 py-2 bg-muted text-foreground text-sm rounded border border-border hover:bg-border">Add</button>
                        </div>
                    </div>
                </section>

                {/* Default Terms */}
                <section className="pt-8 border-t border-border">
                    <label className="block text-sm font-medium mb-2">Default Terms & Conditions</label>
                    <div className="bg-white rounded border border-border">
                        <TinyMCEEditor
                            value={settings.defaultTerms || ''}
                            onEditorChange={(content) => setSettings({ ...settings, defaultTerms: content })}
                            height={400}
                        />
                    </div>
                </section>

                <div className="pt-4 border-t border-border">
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Brand Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
