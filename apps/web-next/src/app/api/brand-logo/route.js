import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BrandSettings from '@/models/BrandSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const settings = await BrandSettings.findOne({}).select('primaryLogoUrl companyName').lean();
        if (!settings) {
            return NextResponse.json({ logoUrl: null, companyName: 'QuickTrails' });
        }
        return NextResponse.json({
            logoUrl: settings.primaryLogoUrl || null,
            companyName: settings.companyName || 'QuickTrails',
        });
    } catch (error) {
        console.error('Brand logo fetch error:', error);
        return NextResponse.json({ logoUrl: null, companyName: 'QuickTrails' });
    }
}
