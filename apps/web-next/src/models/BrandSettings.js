import mongoose from 'mongoose';

const brandSettingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'QuickTrails' },
    primaryLogoUrl: { type: String },
    brandColors: {
        primary: { type: String, default: '#1A202C' },
        accent: { type: String, default: '#D69E2E' },
    },
    contactInfo: {
        phone: String,
        email: String,
        website: String,
        address: String,
    },
    defaultInclusions: [{ type: String }],
    defaultExclusions: [{ type: String }],
    defaultTerms: String,
    defaultWelcomeMessage: String,
}, { timestamps: true });

export default mongoose.models.BrandSettings || mongoose.model('BrandSettings', brandSettingsSchema);
