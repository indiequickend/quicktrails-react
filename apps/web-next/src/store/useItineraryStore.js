import { create } from 'zustand';

export const useItineraryStore = create((set) => ({
    tripTitle: '',
    slug: '',
    totalPrice: '',
    durationText: '',
    days: [],
    heroImage: '',
    terms: '',
    inclusions: [],
    exclusions: [],
    status: 'DRAFT',
    b2bDetails: { isB2B: false, agencyName: '', logoUrl: '' },
    brandSettings: { companyName: 'QuickTrails', primaryLogoUrl: '' },
    destinations: [],

    setTripTitle: (title) => set({ tripTitle: title }),
    setDestinations: (destinations) => set({ destinations }),
    setSlug: (slug) => set({ slug }),
    setStatus: (status) => set({ status }),
    setTotalPrice: (price) => set({ totalPrice: price }),
    setDurationText: (text) => set({ durationText: text }),
    setHeroImage: (url) => set({ heroImage: url }),
    setTerms: (text) => set({ terms: text }),

    setBrandSettings: (settings) => set({ brandSettings: settings }),
    setB2bDetails: (details) => set({ b2bDetails: details }),

    addDay: () => set((state) => ({
        days: [...state.days, { dayNumber: state.days.length + 1, dayTitle: 'New Day', activities: [] }],
    })),

    removeDay: (index) => set((state) => {
        const updatedDays = state.days.filter((_, i) => i !== index);
        updatedDays.forEach((day, i) => { day.dayNumber = i + 1; });
        return { days: updatedDays };
    }),

    updateDayTitle: (index, title) => set((state) => {
        const newDays = [...state.days];
        newDays[index] = { ...newDays[index], dayTitle: title };
        return { days: newDays };
    }),

    updateDayDescription: (index, description) => set((state) => {
        const newDays = [...state.days];
        newDays[index] = { ...newDays[index], dayDescription: description };
        return { days: newDays };
    }),

    setDayImage: (index, url) => set((state) => {
        const newDays = [...state.days];
        newDays[index] = { ...newDays[index], dayHighlightImage: url };
        return { days: newDays };
    }),

    addActivityToDay: (dayIndex, activity, dropIndex) => set((state) => {
        const newDays = [...state.days];
        if (!newDays[dayIndex].activities) newDays[dayIndex].activities = [];
        const activities = [...newDays[dayIndex].activities];
        activities.splice(dropIndex, 0, activity);
        newDays[dayIndex] = { ...newDays[dayIndex], activities };
        return { days: newDays };
    }),

    moveActivity: (sourceDayIndex, destDayIndex, sourceIndex, destIndex) => set((state) => {
        const newDays = state.days.map(d => ({ ...d, activities: [...(d.activities || [])] }));
        const [movedItem] = newDays[sourceDayIndex].activities.splice(sourceIndex, 1);
        if (!newDays[destDayIndex].activities) newDays[destDayIndex].activities = [];
        newDays[destDayIndex].activities.splice(destIndex, 0, movedItem);
        return { days: newDays };
    }),

    removeActivity: (dayIndex, activityIndex) => set((state) => {
        const newDays = state.days.map(d => ({ ...d, activities: [...(d.activities || [])] }));
        newDays[dayIndex].activities.splice(activityIndex, 1);
        return { days: newDays };
    }),

    setInclusions: (inclusions) => set({ inclusions }),
    addInclusion: (text) => set((state) => ({ inclusions: [...state.inclusions, text] })),
    removeInclusion: (index) => set((state) => ({ inclusions: state.inclusions.filter((_, i) => i !== index) })),
    updateInclusion: (index, text) => set((state) => {
        const arr = [...state.inclusions];
        arr[index] = text;
        return { inclusions: arr };
    }),

    setExclusions: (exclusions) => set({ exclusions }),
    addExclusion: (text) => set((state) => ({ exclusions: [...state.exclusions, text] })),
    removeExclusion: (index) => set((state) => ({ exclusions: state.exclusions.filter((_, i) => i !== index) })),
    updateExclusion: (index, text) => set((state) => {
        const arr = [...state.exclusions];
        arr[index] = text;
        return { exclusions: arr };
    }),

    loadItinerary: (data) => set({
        tripTitle: data.tripTitle || '',
        slug: data.slug || '',
        totalPrice: data.totalPrice || '',
        durationText: data.durationText || '',
        heroImage: data.heroGallery?.[0] || '',
        status: data.status || 'DRAFT',
        b2bDetails: data.b2bDetails || { isB2B: false, agencyName: '', logoUrl: '' },
        days: data.days || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        terms: data.terms || '',
        destinations: data.destinations || [],
    }),

    reset: () => set({
        tripTitle: '',
        slug: '',
        durationText: '',
        heroImage: '',
        totalPrice: '',
        status: 'DRAFT',
        b2bDetails: { isB2B: false, agencyName: '', logoUrl: '' },
        days: [],
        destinations: [],
    }),
}));
