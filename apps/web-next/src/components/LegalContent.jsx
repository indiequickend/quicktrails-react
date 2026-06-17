// Shared renderer for the legal pages (privacy/terms/refund-policy) so they
// stay visually consistent without duplicating markup. `sections` is:
// [{ heading?, blocks: [{ type: "p", text } | { type: "ul", items }] }]
// `items` entries are either a string or { text, sub: [string] } for a
// nested bullet list.
function Bullet({ item }) {
  if (typeof item === "string") {
    return <li>{item}</li>;
  }
  return (
    <li>
      {item.text}
      {item.sub?.length > 0 && (
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {item.sub.map((sub, idx) => (
            <li key={idx}>{sub}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Block({ block }) {
  if (block.type === "ul") {
    return (
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
        {block.items.map((item, idx) => (
          <Bullet key={idx} item={item} />
        ))}
      </ul>
    );
  }
  return <p className="text-muted-foreground leading-relaxed">{block.text}</p>;
}

export default function LegalContent({ sections }) {
  return (
    <div className="space-y-10 max-w-3xl">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          {section.heading && <h2 className="text-2xl font-semibold">{section.heading}</h2>}
          {section.subheading && <h3 className="text-lg font-semibold">{section.subheading}</h3>}
          <div className="space-y-4">
            {section.blocks.map((block, bIdx) => (
              <Block key={bIdx} block={block} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
