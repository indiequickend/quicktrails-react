import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  heroImage: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  focusKeyword: { type: String, default: '' },
  keywords: [{ type: String }],
  longTailKeywords: [{ type: String }],
  isActive: { type: Boolean, default: true },
  parentSlug: { type: String, default: '' },
}, { timestamps: true });

DestinationSchema.index({ isActive: 1, name: 1 });

export default mongoose.models.Destination || mongoose.model('Destination', DestinationSchema);
