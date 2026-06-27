import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import dbConnect from "@/lib/mongodb";
import BrandSettings from "@/models/BrandSettings";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Discover Your Next Adventure`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["travel", "hotels", "resorts", "tour packages", "vacation", "India travel", "homestays", "villas"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Discover Your Next Adventure`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Discover Your Next Adventure`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getWhatsAppPhone() {
  try {
    await dbConnect();
    const settings = await BrandSettings.findOne().lean();
    return settings?.contactInfo?.phone ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const whatsappPhone = await getWhatsAppPhone();

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        {children}
        <WhatsAppFloat phone={whatsappPhone} />
      </body>
    </html>
  );
}
