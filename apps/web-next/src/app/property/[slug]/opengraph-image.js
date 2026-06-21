import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getPropertyBySlug } from "@/lib/data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  const fontBold = readFileSync(join(process.cwd(), "public/fonts/PlayfairDisplay-Bold.ttf"));
  const fontRegular = readFileSync(join(process.cwd(), "public/fonts/PlayfairDisplay-Regular.ttf"));

  const name = property?.name || "QuickTrails";
  const location = property?.location || "";
  const category = property?.category || "";
  const rating = property?.rating;
  const imageUrl = property?.images?.[0]?.url || null;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "1200px",
          height: "630px",
          fontFamily: "Playfair",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#0f172a" }} />
        )}

        {/* Gradient overlay — light at top, heavy at bottom */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 42%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "44px 52px",
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                color: "#fbbf24",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              QuickTrails
            </span>
            {category && (
              <div
                style={{
                  background: "#fbbf24",
                  color: "#0f172a",
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "8px 26px",
                  borderRadius: 999,
                  letterSpacing: "0.04em",
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* Bottom content */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "white",
                fontSize: name.length > 30 ? 48 : 58,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 18,
                maxWidth: 900,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {location && (
                <span style={{ color: "#e2e8f0", fontSize: 26, marginRight: 28 }}>
                  📍 {location}
                </span>
              )}
              {rating > 0 && (
                <span style={{ color: "#fbbf24", fontSize: 24, marginRight: 28 }}>
                  ★ {rating}
                </span>
              )}
              <span style={{ color: "#94a3b8", fontSize: 20, marginLeft: "auto" }}>
                quicktrails.com
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: fontBold, weight: 700 },
        { name: "Playfair", data: fontRegular, weight: 400 },
      ],
    }
  );
}
