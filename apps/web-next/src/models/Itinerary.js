import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    tags: [{ type: String }],
    instanceId: String,
});

const daySchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true },
    dayTitle: { type: String, required: true },
    dayDescription: String,
    hotelInfo: String,
    activities: [activitySchema],
    dayHighlightImage: String,
});

const itinerarySchema = new mongoose.Schema({
    tripTitle: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    durationText: { type: String, required: true },
    b2bDetails: {
        isB2B: { type: Boolean, default: false },
        agencyName: String,
        logoUrl: String,
    },
    welcomeMessage: String,
    heroGallery: [{ type: String }],
    layoutStyle: { type: String, enum: ['EDITORIAL', 'CLASSIC', 'MINIMAL'], default: 'EDITORIAL' },
    days: [daySchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    totalPrice: String,
    terms: String,
    status: { type: String, enum: ['DRAFT', 'FINALIZED'], default: 'DRAFT' },
    destinations: [{ type: String }],
}, { timestamps: true });

// Delete the cached model so schema changes are always picked up without a restart
delete mongoose.models['Itinerary'];
export default mongoose.model('Itinerary', itinerarySchema);
