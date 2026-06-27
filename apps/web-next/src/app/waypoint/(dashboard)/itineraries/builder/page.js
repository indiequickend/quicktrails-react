'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getItineraryById, saveItinerary, createItinerary } from '@/lib/actions/itineraries';
import { getCatalogItems } from '@/lib/actions/catalog';
import { getBrandSettings } from '@/lib/actions/brand-settings';
import { useItineraryStore } from '@/store/useItineraryStore';
import B2BPanel from '@/components/B2BPanel';
import SimpleUploadButton from '@/components/admin/SimpleUploadButton';

const TinyMCEEditor = dynamic(() => import('@/components/TinyMCEEditor'), { ssr: false });

function BuilderWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itineraryId = searchParams.get('id') || null;

    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(!!itineraryId);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [newInclusion, setNewInclusion] = useState('');
    const [newExclusion, setNewExclusion] = useState('');
    const [catalogItems, setCatalogItems] = useState([]);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogFilter, setCatalogFilter] = useState('ALL');
    const [toolboxTab, setToolboxTab] = useState('SETUP');
    const [draggingOver, setDraggingOver] = useState(null); // dayIndex being dragged over

    const dragData = useRef(null); // { type: 'CATALOG'|'ACTIVITY', ... }
    const previewRef = useRef(null);

    const {
        tripTitle, setTripTitle,
        slug, setSlug,
        totalPrice, setTotalPrice,
        durationText, setDurationText,
        days, addDay, removeDay, updateDayTitle, updateDayDescription, addActivityToDay, moveActivity, removeActivity,
        b2bDetails,
        heroImage, setHeroImage,
        brandSettings, setBrandSettings,
        inclusions, updateInclusion, addInclusion, removeInclusion, setInclusions,
        exclusions, updateExclusion, addExclusion, removeExclusion, setExclusions,
        terms, setTerms,
        status, setStatus,
        loadItinerary, reset,
    } = useItineraryStore();

    const slugManuallyEdited = useRef(false);

    useEffect(() => {
        setTimeout(() => setIsMounted(true), 100);
        async function init() {
            const brandData = await getBrandSettings();
            if (brandData) {
                setBrandSettings({
                    companyName: brandData.companyName || '',
                    primaryLogoUrl: brandData.primaryLogoUrl || '',
                });
                if (!itineraryId) {
                    setInclusions(brandData.defaultInclusions || []);
                    setExclusions(brandData.defaultExclusions || []);
                    setTerms(brandData.defaultTerms || '');
                }
            }
            if (itineraryId) {
                const res = await getItineraryById(itineraryId);
                if (res.success && res.data) {
                    loadItinerary(res.data);
                    if (brandData) {
                        if (res.data.inclusions.length === 0) setInclusions(brandData.defaultInclusions || []);
                        if (res.data.exclusions.length === 0) setExclusions(brandData.defaultExclusions || []);
                        if (!res.data.terms) setTerms(brandData.defaultTerms || '');
                    }
                }
                setIsLoading(false);
            } else {
                reset();
            }
        }
        init();
    }, [itineraryId]);

    // Auto-fill slug from title only for new itineraries and only while user hasn't manually edited it
    useEffect(() => {
        if (itineraryId) return;
        if (slugManuallyEdited.current) return;
        const generated = tripTitle
            .toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-');
        setSlug(generated);
    }, [tripTitle, itineraryId]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const res = await getCatalogItems(1, 100, catalogSearch);
            if (res.success) {
                let filtered = res.items;
                if (catalogFilter !== 'ALL') filtered = filtered.filter(item => item.type === catalogFilter);
                setCatalogItems(filtered);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [catalogSearch, catalogFilter]);

    const activeAgencyName = b2bDetails?.isB2B && b2bDetails?.agencyName ? b2bDetails.agencyName : brandSettings.companyName;
    const activeLogoUrl = b2bDetails?.isB2B ? (b2bDetails?.logoUrl || null) : brandSettings.primaryLogoUrl;

    const buildPayload = (overrideStatus) => ({
        tripTitle, slug, totalPrice, durationText, b2bDetails, days, inclusions, exclusions, terms,
        heroGallery: heroImage ? [heroImage] : [],
        status: overrideStatus ?? status,
    });

    const handleSave = async () => {
        setIsSaving(true);
        const dataToSave = buildPayload();
        if (itineraryId) {
            const res = await saveItinerary(itineraryId, dataToSave);
            if (res.success) alert('Itinerary updated successfully!');
            else alert('Failed to update.');
        } else {
            const res = await createItinerary(dataToSave);
            if (res.success) {
                alert('New itinerary created successfully!');
                router.replace(`/waypoint/itineraries/builder?id=${res.newId}`);
            } else {
                alert('Failed to create.');
            }
        }
        setIsSaving(false);
    };

    const handlePublishToggle = async () => {
        const newStatus = status === 'FINALIZED' ? 'DRAFT' : 'FINALIZED';
        setIsSaving(true);
        const dataToSave = buildPayload(newStatus);
        let ok = false;
        if (itineraryId) {
            const res = await saveItinerary(itineraryId, dataToSave);
            ok = res.success;
        } else {
            const res = await createItinerary(dataToSave);
            if (res.success) {
                router.replace(`/waypoint/itineraries/builder?id=${res.newId}`);
                ok = true;
            }
        }
        if (ok) setStatus(newStatus);
        else alert('Failed to update status.');
        setIsSaving(false);
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const { generateItineraryPDF } = await import('@/lib/pdf/generateItineraryPDF');
            const pdf = await generateItineraryPDF({
                tripTitle, durationText, totalPrice, heroImage,
                days, inclusions, exclusions, terms,
                activeLogoUrl, activeAgencyName,
            });
            const safeName = (tripTitle || 'Itinerary').replace(/\s+/g, '_');
            pdf.save(`${durationText || 'Itinerary'}_${safeName}_QuickTrails.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('Error generating PDF. Please check the console.');
        } finally {
            setIsExporting(false);
        }
    };

    // HTML5 Drag-and-Drop handlers
    const handleCatalogDragStart = (e, item, index) => {
        dragData.current = { type: 'CATALOG', item, index };
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleActivityDragStart = (e, dayIndex, actIndex) => {
        dragData.current = { type: 'ACTIVITY', dayIndex, actIndex };
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDayDragOver = (e, dayIndex) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = dragData.current?.type === 'CATALOG' ? 'copy' : 'move';
        setDraggingOver(dayIndex);
    };

    const handleDayDragLeave = (e) => {
        // Only clear if we're leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggingOver(null);
        }
    };

    const handleDayDrop = (e, destDayIndex) => {
        e.preventDefault();
        setDraggingOver(null);
        const data = dragData.current;
        if (!data) return;

        if (data.type === 'CATALOG') {
            const item = data.item;
            addActivityToDay(destDayIndex, {
                instanceId: `temp-${Date.now()}`,
                title: item.title,
                description: item.description || '',
                imageUrl: item.images && item.images.length > 0 ? item.images[0].url : '',
                tags: [item.type, item.location, item.estimatedDuration].filter(Boolean),
            });
        } else if (data.type === 'ACTIVITY') {
            if (data.dayIndex !== destDayIndex) {
                moveActivity(data.dayIndex, destDayIndex, data.actIndex, days[destDayIndex]?.activities?.length || 0);
            }
        }
        dragData.current = null;
    };

    if (!isMounted) return null;
    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading workspace...</div></div>;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50 text-sm -m-8">

            {/* TOOLBOX SIDEBAR */}
            <div className="w-80 h-full bg-white shadow-xl border-r border-gray-200 z-40 flex flex-col overflow-hidden shrink-0">
                <div className="bg-gray-900 text-white p-3 flex justify-between items-center shrink-0">
                    <span className="font-semibold text-xs uppercase tracking-wider">Builder Toolbox</span>
                </div>

                <div className="flex border-b border-gray-100 shrink-0 bg-gray-50">
                    <button onClick={() => setToolboxTab('SETUP')} className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${toolboxTab === 'SETUP' ? 'border-b-2 border-amber-500 text-amber-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}>Trip Setup</button>
                    <button onClick={() => setToolboxTab('CATALOG')} className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${toolboxTab === 'CATALOG' ? 'border-b-2 border-amber-500 text-amber-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}>Catalog</button>
                </div>

                <div className="overflow-y-auto flex-grow flex flex-col p-4">
                    {toolboxTab === 'SETUP' && (
                        <div>
                            <div className="space-y-3 mb-4">
                                <input type="text" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} placeholder="Trip Title" className="w-full p-2 border border-gray-300 rounded outline-none text-sm" />
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wider">URL Slug</label>
                                    <div className="flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-amber-500">
                                        <span className="px-2 text-[10px] text-gray-400 bg-gray-50 border-r border-gray-300 shrink-0 select-none">/package/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => {
                                                slugManuallyEdited.current = true;
                                                setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-'));
                                            }}
                                            placeholder="url-slug"
                                            className="flex-1 p-2 outline-none text-sm bg-white"
                                        />
                                    </div>
                                </div>
                                <input type="text" value={durationText} onChange={(e) => setDurationText(e.target.value)} placeholder="Duration (e.g. 5 Nights / 6 Days)" className="w-full p-2 border border-gray-300 rounded outline-none text-sm" />
                                <input type="text" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="Price (e.g. ₹25,000/person)" className="w-full p-2 border border-gray-300 rounded outline-none text-sm" />
                                <div>
                                    <SimpleUploadButton
                                        label={heroImage ? 'Change Cover Image' : 'Upload Cover Image'}
                                        onUpload={setHeroImage}
                                        className="w-full justify-between text-sm text-gray-700 border-gray-300"
                                    />
                                    {heroImage && <div className="mt-2 rounded border border-gray-200 overflow-hidden"><img src={heroImage} alt="Hero" className="w-full object-cover" /></div>}
                                </div>
                            </div>

                            <B2BPanel />

                            {/* Inclusions */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-900 mb-2">Inclusions</label>
                                <div className="space-y-1 mb-2 max-h-28 overflow-y-auto">
                                    {inclusions.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-1.5 bg-green-50 text-green-800 text-xs rounded border border-green-100 group">
                                            <div className="flex items-center gap-1.5 flex-grow mr-1">
                                                <span className="text-green-600 font-bold shrink-0">✓</span>
                                                <input type="text" value={item} onChange={(e) => updateInclusion(idx, e.target.value)} className="bg-transparent border-none outline-none flex-grow text-xs" />
                                            </div>
                                            <button onClick={() => removeInclusion(idx)} className="text-green-600 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 px-1">×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-1.5">
                                    <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newInclusion.trim()) { addInclusion(newInclusion.trim()); setNewInclusion(''); } }} placeholder="Add inclusion..." className="flex-grow p-1.5 text-xs border border-gray-300 rounded outline-none" />
                                    <button onClick={() => { if (newInclusion.trim()) { addInclusion(newInclusion.trim()); setNewInclusion(''); } }} className="px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">Add</button>
                                </div>
                            </div>

                            {/* Exclusions */}
                            <div className="mt-3">
                                <label className="block text-xs font-bold text-gray-900 mb-2">Exclusions</label>
                                <div className="space-y-1 mb-2 max-h-28 overflow-y-auto">
                                    {exclusions.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-1.5 bg-red-50 text-red-800 text-xs rounded border border-red-100 group">
                                            <div className="flex items-center gap-1.5 flex-grow mr-1">
                                                <span className="text-red-600 font-bold shrink-0">✗</span>
                                                <input type="text" value={item} onChange={(e) => updateExclusion(idx, e.target.value)} className="bg-transparent border-none outline-none flex-grow text-xs" />
                                            </div>
                                            <button onClick={() => removeExclusion(idx)} className="text-red-600 hover:text-red-800 font-bold opacity-0 group-hover:opacity-100 px-1">×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-1.5">
                                    <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newExclusion.trim()) { addExclusion(newExclusion.trim()); setNewExclusion(''); } }} placeholder="Add exclusion..." className="flex-grow p-1.5 text-xs border border-gray-300 rounded outline-none" />
                                    <button onClick={() => { if (newExclusion.trim()) { addExclusion(newExclusion.trim()); setNewExclusion(''); } }} className="px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">Add</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {toolboxTab === 'CATALOG' && (
                        <div className="flex flex-col flex-grow min-h-0">
                            <div className="space-y-2 mb-3 shrink-0">
                                <input type="text" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} placeholder="Search catalog..." className="w-full py-2 px-3 border border-gray-300 rounded text-xs outline-none" />
                                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                    {['ALL', 'HOTEL', 'ACTIVITY', 'TRANSFER'].map(f => (
                                        <button key={f} onClick={() => setCatalogFilter(f)} className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold shrink-0 transition ${catalogFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{f === 'HOTEL' ? 'ACCOMMODATION' : f}</button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-2 shrink-0">Drag items onto a day to add them.</p>
                            <div className="overflow-y-auto space-y-2 pr-1 pb-4 min-h-[100px] flex-grow">
                                {catalogItems.map((item, index) => {
                                    let colorTheme = 'text-gray-600', bgTheme = 'bg-gray-100', barTheme = 'bg-gray-400';
                                    if (item.type === 'HOTEL') { colorTheme = 'text-amber-600'; bgTheme = 'bg-amber-50'; barTheme = 'bg-amber-500'; }
                                    else if (item.type === 'ACTIVITY') { colorTheme = 'text-blue-600'; bgTheme = 'bg-blue-50'; barTheme = 'bg-blue-500'; }
                                    else if (item.type === 'TRANSFER') { colorTheme = 'text-green-700'; bgTheme = 'bg-green-50'; barTheme = 'bg-green-500'; }

                                    return (
                                        <div
                                            key={String(item._id)}
                                            draggable
                                            onDragStart={(e) => handleCatalogDragStart(e, item, index)}
                                            className="group relative flex items-center gap-3 p-3 border border-gray-200 rounded bg-white shadow-sm cursor-grab hover:shadow-md active:cursor-grabbing transition select-none"
                                        >
                                            <div className={`w-1 h-full absolute left-0 top-0 bottom-0 ${barTheme} rounded-l`}></div>
                                            <div className="ml-2 flex-grow">
                                                <div className="flex items-center gap-2">
                                                    {item.images?.length > 0 && <img src={item.images[0].url} alt={item.title} className="w-12 h-12 object-cover rounded bg-gray-100 shrink-0" />}
                                                    <div>
                                                        <span className={`text-[9px] font-bold ${colorTheme} ${bgTheme} px-1.5 py-0.5 rounded uppercase tracking-wider`}>{item._isProperty ? 'PROPERTY' : item.type}</span>
                                                        <p className="font-semibold text-gray-900 text-xs mt-1 leading-tight">{item.title}</p>
                                                        {item.location && <p className="text-[10px] text-gray-500 mt-0.5">📍 {item.location}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {catalogItems.length === 0 && <p className="text-center text-xs text-gray-400 py-8">No catalog items found.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DAY BUILDER */}
            <div className="w-[35%] h-full overflow-y-auto border-r border-gray-200 bg-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif font-bold text-gray-900 text-2xl">Daily Schedule</h2>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status === 'FINALIZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {status === 'FINALIZED' ? 'Published' : 'Draft'}
                        </span>
                        <button onClick={handleDownloadPDF} disabled={isExporting} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded disabled:opacity-50">
                            {isExporting ? 'Generating...' : 'PDF'}
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handlePublishToggle} disabled={isSaving} className={`px-3 py-1.5 text-white text-xs font-medium rounded disabled:opacity-50 ${status === 'FINALIZED' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isSaving ? '...' : status === 'FINALIZED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={addDay} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded">+ Day</button>
                    </div>
                </div>

                <div className="space-y-4 pb-8">
                    {days.map((day, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
                            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <span className="font-medium text-gray-900 text-xs uppercase tracking-wider">Day {day.dayNumber}</span>
                                <button onClick={() => removeDay(dayIndex)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                            </div>
                            <div className="p-2 border-b border-gray-100">
                                <input type="text" value={day.dayTitle} onChange={(e) => updateDayTitle(dayIndex, e.target.value)} placeholder="Day Title..." className="w-full p-2 font-medium text-gray-900 bg-transparent outline-none text-sm" />
                                <textarea rows={2} value={day.dayDescription || ''} onChange={(e) => updateDayDescription(dayIndex, e.target.value)} placeholder="Short highlight for this day..." className="w-full p-2 text-sm text-gray-700 bg-gray-50 outline-none focus:bg-white rounded resize-none" />
                            </div>
                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => handleDayDragOver(e, dayIndex)}
                                onDragLeave={handleDayDragLeave}
                                onDrop={(e) => handleDayDrop(e, dayIndex)}
                                className={`p-3 m-2 min-h-[80px] border-2 border-dashed rounded transition ${draggingOver === dayIndex ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
                            >
                                {day.activities?.map((act, actIndex) => {
                                    const safeId = act._id ? String(act._id) : (act.instanceId || `act-${dayIndex}-${actIndex}`);
                                    return (
                                        <div
                                            key={safeId}
                                            draggable
                                            onDragStart={(e) => handleActivityDragStart(e, dayIndex, actIndex)}
                                            className="p-2 mb-2 bg-white border border-gray-200 rounded flex justify-between items-center shadow-sm cursor-grab active:cursor-grabbing select-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                {act.imageUrl && <img src={act.imageUrl} alt={act.title} className="w-10 h-10 object-cover rounded bg-gray-100 shrink-0" />}
                                                <div>
                                                    <span className="font-medium text-gray-900 text-xs">{act.title}</span>
                                                    <div className="flex gap-1 mt-0.5">
                                                        {act.tags?.slice(0, 2).map((tag, i) => <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded uppercase">{tag}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeActivity(dayIndex, actIndex)} className="text-gray-400 hover:text-red-500 text-lg px-1">×</button>
                                        </div>
                                    );
                                })}
                                {(!day.activities || day.activities.length === 0) && (
                                    <div className="text-center text-xs text-gray-400 mt-2 pointer-events-none">Drop catalog items here</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pb-16">
                    <h2 className="font-serif font-bold text-gray-900 text-xl mb-3">Terms & Conditions</h2>
                    <div className="bg-white rounded-md">
                        <TinyMCEEditor
                            value={terms || ''}
                            onEditorChange={(content) => setTerms(content)}
                            height={400}
                        />
                    </div>
                </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="flex-1 h-full overflow-y-auto bg-gray-300 p-8">
                <div ref={previewRef} className="max-w-3xl mx-auto bg-white min-h-[1056px] shadow-2xl border border-gray-200 relative">

                    {/* Hero */}
                    <div className="relative w-full h-[450px] bg-gray-900 overflow-hidden rounded-t-lg">
                        {heroImage ? (
                            <img src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-80" crossOrigin="anonymous" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500 text-sm">Upload a Cover Image in the toolbox</div>
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-10 left-12 right-12 flex justify-between items-center z-10">
                            <div className="flex items-center gap-4">
                                {activeLogoUrl ? <img src={activeLogoUrl} alt={activeAgencyName} className="h-10 w-auto object-contain" crossOrigin="anonymous" /> : null}
                                <span className="font-serif tracking-widest text-lg font-bold text-white drop-shadow-md">{activeAgencyName}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-12 left-12 right-12 z-10">
                            <p className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3 drop-shadow-md flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-amber-400 inline-block"></span>
                                {durationText || ''}
                            </p>
                            <h1 className="text-4xl font-serif font-bold text-white leading-tight drop-shadow-xl max-w-2xl">{tripTitle || ''}</h1>
                            {totalPrice && <p className="text-2xl text-white mt-4 font-bold drop-shadow-md">{totalPrice}</p>}
                        </div>
                    </div>

                    {/* Days */}
                    <div className="p-16">
                        {days.length === 0 ? (
                            <p className="text-gray-400 italic text-center mt-10">Your itinerary schedule will appear here.</p>
                        ) : (
                            <div className="space-y-12">
                                {days.map((day, index) => (
                                    <div key={index} className="flex gap-8">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-base shrink-0">{day.dayNumber}</div>
                                            {index !== days.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-4"></div>}
                                        </div>
                                        <div className="pt-1 w-full">
                                            <div className="avoid-break mb-6">
                                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">{day.dayTitle || `Day ${day.dayNumber}`}</h3>
                                                {day.dayDescription && (
                                                    <p className="text-gray-600 text-sm leading-relaxed italic border-l-2 border-amber-400 pl-4 py-1 bg-amber-50/30">{day.dayDescription}</p>
                                                )}
                                            </div>
                                            {!day.activities || day.activities.length === 0 ? (
                                                <p className="text-gray-500 text-sm mb-4">No activities scheduled yet.</p>
                                            ) : (
                                                <div className="space-y-6">
                                                    {day.activities.map((act, ai) => {
                                                        const displayId = act._id ? String(act._id) : (act.instanceId || `preview-${index}-${ai}`);
                                                        return (
                                                            <div key={displayId} className="avoid-break flex flex-col sm:flex-row gap-6 p-5 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
                                                                {act.imageUrl && (
                                                                    <div className="w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-100">
                                                                        <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-grow">
                                                                    <h4 className="font-bold text-xl text-gray-900 mb-1">{act.title}</h4>
                                                                    {act.tags && act.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                                            {act.tags.map((tag, i) => <span key={i} className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">{tag}</span>)}
                                                                        </div>
                                                                    )}
                                                                    <p className="text-sm text-gray-600 leading-relaxed text-justify">{act.description || 'No description available.'}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inclusions / Exclusions */}
                    {(inclusions.length > 0 || exclusions.length > 0) && (
                        <div className="px-16 pb-16 pt-8 bg-white">
                            <hr className="mb-12 border-gray-200" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {inclusions.length > 0 && (
                                    <div className="avoid-break">
                                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2"><span className="text-green-600">✓</span> Inclusions</h3>
                                        <ul className="space-y-3">
                                            {inclusions.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                                    <span className="text-green-500 mt-0.5 text-[10px]">✦</span><span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {exclusions.length > 0 && (
                                    <div className="avoid-break">
                                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2"><span className="text-red-600">✗</span> Exclusions</h3>
                                        <ul className="space-y-3">
                                            {exclusions.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                                    <span className="text-red-400 mt-0.5 text-[10px]">✦</span><span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    {terms && terms.trim() !== '' && (
                        <div className="px-16 pb-16 bg-white">
                            <hr className="mb-8 border-gray-200" />
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Terms & Conditions</h3>
                            <div
                                className="text-gray-600 leading-relaxed space-y-3 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-800"
                                dangerouslySetInnerHTML={{ __html: terms }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-500">Initializing builder...</div>}>
            <BuilderWorkspace />
        </Suspense>
    );
}
