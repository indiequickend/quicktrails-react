// Renders a JSON-LD <script> tag. Keep this a plain server component --
// crawlers (search + AI agents) need this present in the initial HTML.
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
