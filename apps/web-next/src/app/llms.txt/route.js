import { getProperties, getPackages } from "@/lib/data";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { priceUnitLabel } from "@/lib/utils";

// llms.txt (https://llmstxt.org/) -- a plain-text index of the site aimed at
// LLM/AI-agent crawlers that don't render JavaScript. Generated live from
// MongoDB on each request (cached via `revalidate`), not parsed out of JSX
// like the old build-time regex hack.
export const revalidate = 3600;

export async function GET() {
  const [properties, packages] = await Promise.all([getProperties(), getPackages()]);

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
  for (const pkg of packages) {
    lines.push(
      `- [${pkg.name}](${SITE_URL}/package/${pkg.slug}): ${pkg.duration}-day trip to ${pkg.destination}, from ₹${pkg.price}/person. ${pkg.description || ""}`.trim()
    );
  }
  lines.push("");

  // Per the llms.txt spec (llmstxt.org), secondary/boilerplate pages go
  // under "Optional" -- safe for a context-constrained reader to skip.
  lines.push("## Optional");
  lines.push(`- [Privacy Policy](${SITE_URL}/privacy): How QuickTrails collects and uses personal information.`);
  lines.push(`- [Terms of Service](${SITE_URL}/terms): Terms for bookings, tour packages and car rental services.`);
  lines.push(`- [Refund Policy](${SITE_URL}/refund-policy): Cancellation, rescheduling and refund terms.`);

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
