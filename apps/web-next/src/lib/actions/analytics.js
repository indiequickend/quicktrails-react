"use server";

import dbConnect from "@/lib/mongodb";
import PageView from "@/models/PageView";

function parseSource(referrer, utmSource) {
  if (utmSource) return utmSource.toLowerCase().slice(0, 50);
  if (!referrer) return "direct";
  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "");
    if (hostname.includes("google."))    return "google";
    if (hostname.includes("bing."))      return "bing";
    if (hostname.includes("instagram.")) return "instagram";
    if (hostname.includes("facebook.") || hostname === "fb.com" || hostname === "fb.me") return "facebook";
    if (hostname === "wa.me" || hostname.includes("whatsapp.")) return "whatsapp";
    if (hostname.includes("twitter.") || hostname === "x.com" || hostname === "t.co") return "twitter";
    if (hostname.includes("linkedin."))  return "linkedin";
    if (hostname.includes("youtube."))   return "youtube";
    // Return root domain as source for anything else
    const parts = hostname.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return "other";
  }
}

export async function recordPageView({ path, slug, refType, referrer, utmSource, utmMedium, utmCampaign }) {
  try {
    // Basic input validation — everything is optional except path
    if (!path || typeof path !== "string") return;

    await dbConnect();
    await PageView.create({
      path:        String(path).slice(0, 200),
      slug:        String(slug || "").slice(0, 200),
      refType:     ["property", "package", "page"].includes(refType) ? refType : "page",
      source:      parseSource(String(referrer || ""), String(utmSource || "")),
      referrer:    String(referrer || "").slice(0, 500),
      utmSource:   String(utmSource || "").slice(0, 100),
      utmMedium:   String(utmMedium || "").slice(0, 100),
      utmCampaign: String(utmCampaign || "").slice(0, 100),
    });
  } catch {
    // Silently fail — tracking must never break the page
  }
}
