import { getProperties } from "@/lib/data";
import { getPublicItineraries } from "@/lib/actions/itineraries";
import { getPublicDestinations } from "@/lib/actions/destinations";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { priceUnitLabel } from "@/lib/utils";

export const revalidate = 3600;

export async function GET() {
  const [properties, itineraries, destinations] = await Promise.all([
    getProperties(),
    getPublicItineraries(200),
    getPublicDestinations(),
  ]);

  const lines = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push("## Pages");
  lines.push(`- [Home](${SITE_URL}/): Overview, featured properties and packages.`);
  lines.push(`- [Properties](${SITE_URL}/properties): Full list of hotels, resorts, villas and homestays.`);
  lines.push(`- [Tour Packages](${SITE_URL}/tour-packages): Full list of curated multi-day tour packages.`);
  lines.push(`- [About](${SITE_URL}/about): Company background.`);
  lines.push(`- [Contact](${SITE_URL}/contact): Enquiry/booking form.`);
  lines.push("");

  if (destinations.length > 0) {
    lines.push("## Destinations");
    const regions = destinations.filter(d => !d.parentSlug);
    const cities = destinations.filter(d => !!d.parentSlug);
    for (const d of regions) {
      const childNames = cities.filter(c => c.parentSlug === d.slug).map(c => c.name).join(", ");
      const childStr = childNames ? ` Includes: ${childNames}.` : "";
      lines.push(`- [${d.name}](${SITE_URL}/destination/${d.slug}): Travel guide for ${d.name}.${childStr}${d.tagline ? " " + d.tagline : ""}`);
    }
    for (const d of cities) {
      lines.push(`- [${d.name}](${SITE_URL}/destination/${d.slug}): Hotels and tours in ${d.name}.${d.tagline ? " " + d.tagline : ""}`);
    }
    lines.push("");
  }

  lines.push("## Properties");
  for (const p of properties) {
    const cheapestRoom = p.roomTypes?.[0];
    const price = cheapestRoom?.price
      ? ` from ₹${cheapestRoom.price}${priceUnitLabel(cheapestRoom.priceUnit)}`
      : "";
    lines.push(
      `- [${p.name}](${SITE_URL}/property/${p.slug}): ${p.category || "Property"} in ${p.location}${price}. ${p.description || ""}`.trim()
    );
  }
  lines.push("");

  lines.push("## Tour Packages");
  for (const pkg of itineraries) {
    if (!pkg.slug) continue;
    const price = pkg.totalPrice ? ` — ${pkg.totalPrice}` : "";
    const days = pkg.days?.map((d) => d.dayTitle).filter(Boolean).join(", ");
    const summary = days ? ` Covers: ${days}.` : "";
    lines.push(
      `- [${pkg.tripTitle}](${SITE_URL}/package/${pkg.slug}): ${pkg.durationText}${price}.${summary}`.trim()
    );
  }
  lines.push("");

  lines.push("## Optional");
  lines.push(`- [Privacy Policy](${SITE_URL}/privacy): How QuickTrails collects and uses personal information.`);
  lines.push(`- [Terms of Service](${SITE_URL}/terms): Terms for bookings, tour packages and car rental services.`);
  lines.push(`- [Refund Policy](${SITE_URL}/refund-policy): Cancellation, rescheduling and refund terms.`);

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
