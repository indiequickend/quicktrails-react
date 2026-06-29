import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  selfPlanDiscount: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, default: 5 },
  },
}, { timestamps: true });

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);
