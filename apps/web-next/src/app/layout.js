import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
