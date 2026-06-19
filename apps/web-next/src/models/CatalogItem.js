import mongoose from 'mongoose';

const catalogImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    altText: String,
    isHighRes: { type: Boolean, default: true },
});

const catalogItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['ACTIVITY', 'HOTEL', 'TRANSFER', 'DESTINATION'],
        required: true,
    },
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: String,
    images: [catalogImageSchema],
    estimatedDuration: String,
    internalNotes: String,
}, { timestamps: true });

export default mongoose.models.CatalogItem || mongoose.model('CatalogItem', catalogItemSchema);
