'use server';

import dbConnect from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { revalidatePath } from 'next/cache';

function toSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

async function uniqueSlug(base, excludeId = null) {
    let slug = base;
    let attempt = 0;
    while (true) {
        const query = { slug };
        if (excludeId) query._id = { $ne: excludeId };
        const exists = await Itinerary.exists(query);
        if (!exists) return slug;
        attempt++;
        slug = `${base}-${attempt}`;
    }
}

export async function createItinerary(itineraryData) {
    await dbConnect();
    try {
        const base = itineraryData.slug ? itineraryData.slug.trim() : toSlug(itineraryData.tripTitle);
        const slug = await uniqueSlug(base);
        const newItinerary = await Itinerary.create({ ...itineraryData, slug });
        revalidatePath('/tour-packages');
        revalidatePath('/sitemap.xml');
        return { success: true, newId: newItinerary._id.toString() };
    } catch (error) {
        console.error('Create itinerary error:', error);
        return { success: false, error: 'Failed to create itinerary' };
    }
}

export async function saveItinerary(id, itineraryData) {
    await dbConnect();
    try {
        const existing = await Itinerary.findById(id).select('slug tripTitle').lean();
        let slug;
        if (itineraryData.slug && itineraryData.slug.trim()) {
            const incoming = itineraryData.slug.trim();
            slug = incoming !== existing?.slug
                ? await uniqueSlug(incoming, id)
                : existing.slug;
        } else {
            slug = existing?.slug || await uniqueSlug(toSlug(itineraryData.tripTitle), id);
        }
        const oldSlug = existing?.slug;
        await Itinerary.findByIdAndUpdate(id, { $set: { ...itineraryData, slug } }, { new: true });
        if (oldSlug && oldSlug !== slug) revalidatePath(`/package/${oldSlug}`);
        revalidatePath('/');
        revalidatePath('/tour-packages');
        revalidatePath(`/package/${slug}`);
        revalidatePath('/sitemap.xml');
        return { success: true };
    } catch (error) {
        console.error('Save itinerary error:', error);
        return { success: false, error: 'Failed to save itinerary' };
    }
}

export async function getItineraries(page = 1, limit = 10, search = '') {
    await dbConnect();
    try {
        const query = search ? { tripTitle: { $regex: search, $options: 'i' } } : {};
        const skip = (page - 1) * limit;
        const items = await Itinerary.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
        const total = await Itinerary.countDocuments(query);
        return {
            success: true,
            items: JSON.parse(JSON.stringify(items)),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Fetch itineraries error:', error);
        return { success: false, items: [], totalPages: 0, currentPage: 1 };
    }
}

export async function getItineraryById(id) {
    await dbConnect();
    try {
        const itinerary = await Itinerary.findById(id).lean();
        if (!itinerary) return { success: false, error: 'Itinerary not found' };
        return { success: true, data: JSON.parse(JSON.stringify(itinerary)) };
    } catch (error) {
        console.error('Fetch itinerary error:', error);
        return { success: false, error: 'Failed to load itinerary' };
    }
}

export async function duplicateItinerary(id) {
    await dbConnect();
    try {
        const original = await Itinerary.findById(id).lean();
        if (!original) return { success: false, error: 'Itinerary not found' };
        const { _id, createdAt, updatedAt, ...rest } = original;
        rest.tripTitle = `${rest.tripTitle} (Copy)`;
        rest.status = 'DRAFT';
        const duplicated = await Itinerary.create(rest);
        revalidatePath('/waypoint/itineraries');
        return { success: true, newId: duplicated._id.toString() };
    } catch (error) {
        console.error('Duplicate itinerary error:', error);
        return { success: false, error: 'Failed to duplicate' };
    }
}

export async function deleteItinerary(id) {
    await dbConnect();
    try {
        const doc = await Itinerary.findById(id).select('slug').lean();
        await Itinerary.findByIdAndDelete(id);
        if (doc?.slug) revalidatePath(`/package/${doc.slug}`);
        revalidatePath('/waypoint/itineraries');
        revalidatePath('/tour-packages');
        revalidatePath('/sitemap.xml');
        return { success: true };
    } catch (error) {
        console.error('Delete itinerary error:', error);
        return { success: false, error: 'Failed to delete itinerary' };
    }
}

export async function getPublicItineraries(limit = 50) {
    await dbConnect();
    try {
        const items = await Itinerary.find({ status: 'FINALIZED', 'b2bDetails.isB2B': { $ne: true } })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();
        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.error('Fetch public itineraries error:', error);
        return [];
    }
}
