import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Refund Policy",
  description: "QuickTrails' terms and conditions for cancellations, rescheduling, and refunds on hotel, homestay and tour package bookings.",
  alternates: { canonical: "/refund-policy" },
};

const sections = [
  {
    blocks: [
      {
        type: "p",
        text: "At QuickTrails, a unit of Indie Quickend LLP, we strive to provide the best travel experiences. We understand that sometimes plans change, and you may need to cancel your bookings. This Refund Policy outlines the terms and conditions regarding cancellations and refunds for bookings made through our website.",
      },
    ],
  },
  {
    heading: "General Refund Policy",
    blocks: [
      {
        type: "ul",
        items: [
          "Eligibility: Refunds are available for bookings that meet the criteria outlined in this policy. Homestays generally do not refund booking amounts. Customers can opt to reschedule within 3 months (excluding peak seasons and public holidays).",
          "Refund/reschedule Requests: To request a refund or reschedule, please contact our customer service team at contact@quicktrails.com. Include your booking details and cancellation reason.",
          "Refund or reschedule requests won't be entertained after the reservation date.",
        ],
      },
    ],
  },
  {
    heading: "Cancellation and Refund Conditions",
    blocks: [],
  },
  {
    subheading: "Hotels & Homestays booking",
    blocks: [
      {
        type: "ul",
        items: [
          "100% refund or reschedule on cancellation before 30 days of arrival",
          "50% refund or reschedule on cancellation within 30 to 15 days before arrival",
          "0% refund or reschedule on cancellation within 14 days before arrival",
        ],
      },
    ],
  },
  {
    subheading: "Tour Package booking",
    blocks: [
      { type: "p", text: "Full Cancellation:" },
      {
        type: "ul",
        items: [
          "0% refund on cancellation within 30 days before arrival or reschedule within 3 months (excluding peak season and public holidays)",
        ],
      },
      { type: "p", text: "Partial Cancellation:" },
      {
        type: "ul",
        items: [
          "30% per-person cancellation charges if notified 30-15 days before arrival",
          "50% per-person cancellation charges if notified 14 days before arrival",
          "100% per-person cancellation charges if notified within 7 days",
        ],
      },
    ],
  },
  {
    blocks: [
      {
        type: "p",
        text: "Please Note: Cancellation policy is subject to change. It depends on the hotel/homestay policy and car providers. Peak season bookings typically charge 100% cancellation fees.",
      },
    ],
  },
  {
    heading: "Processing Refunds",
    blocks: [
      {
        type: "ul",
        items: [
          "Refund Method: Refunds will be processed using the same payment method used for the booking.",
          "Refund Time Frame: Refunds will be processed within 5-7 business days of receiving the cancellation request.",
        ],
      },
    ],
  },
  {
    heading: "Non-Refundable Conditions",
    blocks: [
      {
        type: "ul",
        items: [
          "Non-Refundable Bookings: Some bookings are non-refundable, stated clearly at booking. Car provider advances are non-refundable.",
          "Additional Fees: Processing fees, transaction fees, and permit charges are non-refundable.",
        ],
      },
    ],
  },
  {
    heading: "Changes and Modifications",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to modify this Refund Policy at any time. Changes become effective immediately upon posting online.",
      },
    ],
  },
  {
    heading: "Contact Us",
    blocks: [{ type: "p", text: "Email: contact@quicktrails.com" }],
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Refund Policy", path: "/refund-policy" }]} />
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-balance">Refund Policy</h1>
          <LegalContent sections={sections} />
        </div>
      </div>
      <Footer />
    </>
  );
}
