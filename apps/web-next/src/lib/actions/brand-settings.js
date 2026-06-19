'use server';

import dbConnect from '@/lib/mongodb';
import BrandSettings from '@/models/BrandSettings';

export async function getBrandSettings() {
    await dbConnect();
    try {
        const settings = await BrandSettings.findOne({}).lean();
        if (!settings) return null;
        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to fetch brand settings:', error);
        return null;
    }
}

export async function updateBrandSettings(formData) {
    await dbConnect();
    try {
        const settings = await BrandSettings.findOneAndUpdate({}, formData, {
            new: true,
            upsert: true,
        }).lean();
        return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
    } catch (error) {
        console.error('Failed to update brand settings:', error);
        return { success: false, error: 'Failed to update brand settings' };
    }
}
