'use server';

import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Itinerary from '@/models/Itinerary';
import { getPublicDestinations } from '@/lib/actions/destinations';

const PROPERTY_SORTS = {
    price_asc: { minPrice: 1 },
    price_desc: { minPrice: -1 },
    rating_desc: { rating: -1 },
    newest: { updatedAt: -1 },
};

const ITINERARY_SORTS = {
    duration_asc: { dayCount: 1 },
    duration_desc: { dayCount: -1 },
    newest: { updatedAt: -1 },
};

const DURATION_BUCKETS = {
    short: { min: 1, max: 3, label: '1-3 days' },
    medium: { min: 4, max: 6, label: '4-6 days' },
    long: { min: 7, max: null, label: '7+ days' },
};

// Location is free text ("Darjeeling" vs "Darjeeling, West Bengal" both exist
// for the same place) -- normalize to the part before the first comma, trimmed
// and lowercased, so near-duplicate values collapse into one filter option.
const NORMALIZED_LOCATION_EXPR = {
    $toLower: { $trim: { input: { $arrayElemAt: [{ $split: ['$location', ','] }, 0] } } },
};

export async function getPropertiesPage({ filters = {}, skip = 0, limit = 12 } = {}) {
    await dbConnect();

    const match = {};
    if (filters.location?.length) {
        match.normalizedLocation = { $in: filters.location.map((v) => v.toLowerCase()) };
    }
    if (filters.category?.length) match.category = { $in: filters.category };
    if (filters.amenities?.length) match.amenities = { $all: filters.amenities };
    if (filters.minRating) match.rating = { $gte: Number(filters.minRating) };

    const pipeline = [
        {
            $addFields: {
                minPrice: { $min: '$roomTypes.price' },
                normalizedLocation: NORMALIZED_LOCATION_EXPR,
            },
        },
        { $match: match },
    ];

    if (filters.minPrice != null || filters.maxPrice != null) {
        const priceMatch = {};
        if (filters.minPrice != null) priceMatch.$gte = Number(filters.minPrice);
        if (filters.maxPrice != null) priceMatch.$lte = Number(filters.maxPrice);
        pipeline.push({ $match: { minPrice: priceMatch } });
    }

    pipeline.push(
        { $sort: PROPERTY_SORTS[filters.sort] || PROPERTY_SORTS.newest },
        { $skip: skip },
        { $limit: limit + 1 }
    );

    const docs = await Property.aggregate(pipeline);
    const hasMore = docs.length > limit;
    const items = docs.slice(0, limit);
    return JSON.parse(JSON.stringify({ items, hasMore }));
}

export async function getPropertyFilterOptions() {
    await dbConnect();

    // .distinct() issues a `distinct` command, which this cluster's strict
    // serverApi (v1, src/lib/mongodb.js) rejects -- use $group aggregations instead.
    const [locationDocs, amenityDocs, priceBounds] = await Promise.all([
        Property.aggregate([
            {
                $addFields: {
                    normalizedLocation: NORMALIZED_LOCATION_EXPR,
                    displayLocation: { $trim: { input: { $arrayElemAt: [{ $split: ['$location', ','] }, 0] } } },
                },
            },
            { $group: { _id: '$normalizedLocation', label: { $first: '$displayLocation' } } },
        ]),
        Property.aggregate([{ $unwind: '$amenities' }, { $group: { _id: '$amenities' } }]),
        Property.aggregate([
            { $unwind: '$roomTypes' },
            { $group: { _id: null, min: { $min: '$roomTypes.price' }, max: { $max: '$roomTypes.price' } } },
        ]),
    ]);

    const categories = Property.schema.path('category').enumValues;
    const bounds = priceBounds[0] || { min: 0, max: 10000 };

    return {
        locations: locationDocs
            .filter((d) => d._id)
            .map((d) => ({ value: d._id, label: d.label }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        categories,
        amenities: amenityDocs.map((d) => d._id).filter(Boolean).sort(),
        priceMin: bounds.min ?? 0,
        priceMax: bounds.max ?? 10000,
    };
}

export async function getPackagesPage({ filters = {}, skip = 0, limit = 12 } = {}) {
    await dbConnect();

    const match = { status: 'FINALIZED', 'b2bDetails.isB2B': { $ne: true } };
    if (filters.destinations?.length) match.destinations = { $in: filters.destinations };

    const pipeline = [
        { $match: match },
        { $addFields: { dayCount: { $size: { $ifNull: ['$days', []] } } } },
    ];

    if (filters.duration && DURATION_BUCKETS[filters.duration]) {
        const { min, max } = DURATION_BUCKETS[filters.duration];
        const dayMatch = {};
        if (min != null) dayMatch.$gte = min;
        if (max != null) dayMatch.$lte = max;
        pipeline.push({ $match: { dayCount: dayMatch } });
    }

    pipeline.push(
        { $sort: ITINERARY_SORTS[filters.sort] || ITINERARY_SORTS.newest },
        { $skip: skip },
        { $limit: limit + 1 }
    );

    const docs = await Itinerary.aggregate(pipeline);
    const hasMore = docs.length > limit;
    const items = docs.slice(0, limit);
    return JSON.parse(JSON.stringify({ items, hasMore }));
}

export async function getPackageFilterOptions() {
    await dbConnect();

    const destinations = await getPublicDestinations();

    return {
        destinations: destinations.map((d) => ({ name: d.name, slug: d.slug })),
        durationBuckets: Object.entries(DURATION_BUCKETS).map(([value, { label }]) => ({ value, label })),
    };
}
