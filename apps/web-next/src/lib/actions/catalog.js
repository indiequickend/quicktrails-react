'use server';

import dbConnect from '@/lib/mongodb';
import CatalogItem from '@/models/CatalogItem';
import Property from '@/models/Property';
import { revalidatePath } from 'next/cache';

export async function saveCatalogItem(formData) {
    await dbConnect();
    try {
        const newItem = await CatalogItem.create(formData);
        revalidatePath('/admin/catalog');
        return { success: true, id: newItem._id.toString() };
    } catch (error) {
        console.error('Save catalog item error:', error);
        return { success: false, error: 'Database Error' };
    }
}

export async function getCatalogItems(page = 1, limit = 50, search = '') {
    await dbConnect();
    try {
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};
        const skip = (page - 1) * limit;
        const items = await CatalogItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        const total = await CatalogItem.countDocuments(query);

        // Also fetch properties mapped as HOTEL catalog items
        const propQuery = search ? { name: { $regex: search, $options: 'i' } } : {};
        const properties = await Property.find(propQuery).sort({ name: 1 }).lean();
        const propertyItems = properties.map(p => ({
            _id: p._id,
            type: 'HOTEL',
            title: p.name,
            location: p.location,
            description: p.description || '',
            images: (p.images || []).map(img => ({ url: img.url, altText: img.alt || p.name })),
            estimatedDuration: 'Overnight Stay',
            _isProperty: true,
        }));

        const allItems = [...JSON.parse(JSON.stringify(items)), ...JSON.parse(JSON.stringify(propertyItems))];

        return {
            success: true,
            items: allItems,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Fetch catalog error:', error);
        return { success: false, items: [], totalPages: 0, currentPage: 1 };
    }
}

export async function getCatalogItemsOnly(page = 1, limit = 10, search = '') {
    await dbConnect();
    try {
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};
        const skip = (page - 1) * limit;
        const items = await CatalogItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        const total = await CatalogItem.countDocuments(query);
        return {
            success: true,
            items: JSON.parse(JSON.stringify(items)),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Fetch catalog error:', error);
        return { success: false, items: [], totalPages: 0, currentPage: 1 };
    }
}

export async function getCatalogItemById(id) {
    await dbConnect();
    try {
        const item = await CatalogItem.findById(id).lean();
        return { success: true, item: JSON.parse(JSON.stringify(item)) };
    } catch (error) {
        console.error('Fetch catalog item error:', error);
        return { success: false, item: null };
    }
}

export async function updateCatalogItem(id, formData) {
    await dbConnect();
    try {
        await CatalogItem.findByIdAndUpdate(id, formData);
        revalidatePath('/admin/catalog');
        return { success: true };
    } catch (error) {
        console.error('Update catalog item error:', error);
        return { success: false, error: 'Database Error' };
    }
}

export async function deleteCatalogItem(id) {
    await dbConnect();
    try {
        await CatalogItem.findByIdAndDelete(id);
        revalidatePath('/admin/catalog');
        return { success: true };
    } catch (error) {
        console.error('Delete catalog item error:', error);
        return { success: false, error: 'Database Error' };
    }
}
