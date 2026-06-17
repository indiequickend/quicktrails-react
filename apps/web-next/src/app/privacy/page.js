import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Privacy Policy",
  description: "How QuickTrails collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    blocks: [
      {
        type: "p",
        text: "QuickTrails, a unit of Indie Quickend LLP, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website and use our services.",
      },
    ],
  },
  {
    heading: "1. Information We Collect",
    blocks: [
      { type: "p", text: "We collect various types of information in connection with the services we provide, including:" },
      {
        type: "ul",
        items: [
          "Personal Information: When you make a booking or create an account, we collect personal details such as your name, email address, phone number, mailing address, and payment information.",
          "Booking Details: Information about your bookings, including hotel or homestay details, tour packages, dates of travel, and any special requests.",
          "Usage Data: Information on how you use our website, collected through cookies and analytics tools. This includes your IP address, browser type, pages visited, and time spent on our site.",
          "Communication Data: When you contact us for customization of tour packages or other inquiries, we collect information about your communications.",
        ],
      },
    ],
  },
  {
    heading: "2. How We Use Your Information",
    blocks: [
      { type: "p", text: "We use your information for various purposes, including:" },
      {
        type: "ul",
        items: [
          "To process and confirm your bookings and payments.",
          "To communicate with you regarding your bookings and respond to your inquiries.",
          "To personalize your experience on our website and improve our services.",
          "To send you promotional offers and updates about QuickTrails, with your consent.",
          "To comply with legal obligations and resolve any disputes.",
        ],
      },
    ],
  },
  {
    heading: "3. Data Sharing",
    blocks: [
      { type: "p", text: "We may share your information with third parties in the following circumstances:" },
      {
        type: "ul",
        items: [
          "Service Providers: We share your information with trusted service providers, such as payment processors and hotel or tour operators, to facilitate your bookings and payments.",
          "Legal Requirements: We may disclose your information if required by law or in response to legal processes.",
          "Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.",
        ],
      },
    ],
  },
  {
    heading: "4. Data Security",
    blocks: [
      {
        type: "p",
        text: "We take the security of your data seriously and implement appropriate measures to protect it. This includes using encryption for sensitive information and maintaining secure servers. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    heading: "5. Your Rights",
    blocks: [
      { type: "p", text: "You have the right to:" },
      {
        type: "ul",
        items: [
          "Access and review the personal information we hold about you.",
          "Request corrections to any inaccurate or incomplete information.",
          "Request the deletion of your personal information, subject to legal obligations.",
          "Opt-out of receiving marketing communications from us.",
        ],
      },
      { type: "p", text: "To exercise these rights, please contact us at contact@quicktrails.com." },
    ],
  },
  {
    heading: "6. Cookies",
    blocks: [
      {
        type: "p",
        text: "Our website uses cookies to enhance your user experience. Cookies are small files placed on your device that allow us to track your activity and preferences. You can choose to disable cookies through your browser settings, but this may affect the functionality of our website.",
      },
    ],
  },
  {
    heading: "7. Changes to This Privacy Policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the updated policy on our website.",
      },
    ],
  },
  {
    heading: "8. Contact Us",
    blocks: [
      { type: "p", text: "If you have any questions or concerns about our Privacy Policy, please contact us at:" },
      { type: "p", text: "Email: contact@quicktrails.com" },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }]} />
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-balance">Privacy Policy</h1>
          <LegalContent sections={sections} />
        </div>
      </div>
      <Footer />
    </>
  );
}
