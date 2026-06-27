import mongoose from "mongoose";

const PageViewSchema = new mongoose.Schema(
  {
    path:        { type: String, required: true },
    slug:        { type: String, default: "" },
    refType:     { type: String, enum: ["property", "package", "page"], default: "page" },
    source:      { type: String, default: "direct" },
    referrer:    { type: String, default: "" },
    utmSource:   { type: String, default: "" },
    utmMedium:   { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
  },
  { timestamps: true }
);

PageViewSchema.index({ createdAt: -1 });
PageViewSchema.index({ source: 1, createdAt: -1 });
PageViewSchema.index({ path: 1, createdAt: -1 });

export default mongoose.models.PageView || mongoose.model("PageView", PageViewSchema);
