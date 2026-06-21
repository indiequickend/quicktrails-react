import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import dbConnect from "@/lib/mongodb";
import Itinerary from "@/models/Itinerary";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getItinerary(slug) {
  try {
    await dbConnect();
    const doc = await Itinerary.findOne({ slug }).lean();
    if (!doc || doc.status !== "FINALIZED" || doc.b2bDetails?.isB2B) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch {
    return null;
  }
}

export default async function Image({ params }) {
  const { slug } = await params;
  const itinerary = await getItinerary(slug);

  const fontBold = readFileSync(join(process.cwd(), "public/fonts/PlayfairDisplay-Bold.ttf"));
  const fontRegular = readFileSync(join(process.cwd(), "public/fonts/PlayfairDisplay-Regular.ttf"));
  const logoData = readFileSync(join(process.cwd(), "public/quicktrails-logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  const title = itinerary?.tripTitle || "QuickTrails";
  const duration = itinerary?.durationText || "";
  const imageUrl = itinerary?.heroGallery?.[0] || null;
  const dayCount = itinerary?.days?.length ?? 0;

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

        {/* Gradient overlay */}
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
            <img src={logoSrc} width={160} height={48} style={{ objectFit: "contain", objectPosition: "left" }} />
            {duration && (
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
                {duration}
              </div>
            )}
          </div>

          {/* Bottom content */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#fbbf24",
                fontSize: 18,
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Tour Package
            </div>
            <div
              style={{
                color: "white",
                fontSize: title.length > 40 ? 44 : 54,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 20,
                maxWidth: 950,
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {dayCount > 0 && (
                <span style={{ color: "#e2e8f0", fontSize: 24, marginRight: 28 }}>
                  🗓 {dayCount} {dayCount === 1 ? "day" : "days"} itinerary
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
