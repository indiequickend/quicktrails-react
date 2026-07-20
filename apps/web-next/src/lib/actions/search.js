'use server';

import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Itinerary from '@/models/Itinerary';
import Destination from '@/models/Destination';

const RESULTS_PER_TYPE = 12;

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchAll(rawQuery) {
    const query = (rawQuery || '').trim();
    if (!query) {
        return { properties: [], itineraries: [], destinations: [] };
    }

    await dbConnect();
    const rx = { $regex: escapeRegex(query), $options: 'i' };

    const [properties, itineraries, destinations] = await Promise.all([
        Property.find({ $or: [{ name: rx }, { location: rx }] })
            .limit(RESULTS_PER_TYPE)
            .lean(),
        Itinerary.find({
            status: 'FINALIZED',
            'b2bDetails.isB2B': { $ne: true },
            $or: [{ tripTitle: rx }, { destinations: rx }],
        })
            .limit(RESULTS_PER_TYPE)
            .lean(),
        Destination.find({ isActive: true, $or: [{ name: rx }, { tagline: rx }] })
            .limit(RESULTS_PER_TYPE)
            .lean(),
    ]);

    return JSON.parse(JSON.stringify({ properties, itineraries, destinations }));
}
