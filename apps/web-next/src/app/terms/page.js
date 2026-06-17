import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using QuickTrails' website, bookings, tour packages and car rental services.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    blocks: [
      {
        type: "p",
        text: "Welcome to QuickTrails, a unit of Indie Quickend LLP. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.",
      },
    ],
  },
  {
    heading: "General Information",
    blocks: [
      {
        type: "p",
        text: "QuickTrails is a travel agency that offers listings of hotels, homestays, car rental and tour packages. Users can also contact us to customize tour packages.",
      },
    ],
  },
  {
    heading: "Services Provided",
    blocks: [
      {
        type: "ul",
        items: [
          "Hotel and Homestay Listings: We provide detailed listings of hotels and homestays, including amenities, prices, and availability.",
          "Tour Packages: We offer a variety of tour packages that users can book directly through our website.",
          "Car Rental: We offer reserved 4 seater / 7 seater cars for complete tour or pickup/drop basis at a reasonable rate.",
          "Customization: Users can contact us to customize their tour packages according to their preferences and needs.",
        ],
      },
    ],
  },
  {
    heading: "Cab Booking Notable Details",
    blocks: [
      {
        type: "ul",
        items: [
          "Parking / Entry fee if any required to be paid ON SPOT.",
          "Cab & Driver will be provided basis of point to point only. Anything beyond the given itinerary will be chargeable.",
          "Some Point depend on Police Token Pass / Permit, if pass/token not given by concern authorities refund/adjustment/next day attempt not possible.",
          "If need to take diverted long route for Political Unrest / Land Slide / Road Blockage / natural disasters / VIP Movements / No Entry by Authority then extra cab charges will be applicable.",
          "Cab / Driver can be changed as per the state & local syndicate Rules.",
          "Vehicle Model will be provided as per Availability on Best to Best Same & Similar Category.",
          "For any alteration of itinerary, please contact us. We are not liable for any communication from drivers or any other person except our team members.",
          "Please note all drivers are not aware about any particular homestay/hotel. If the accommodation booked by us, we'll provide you the location.",
          "In case of any unavoidable malfunction in vehicle, back up vehicle will be provided but it will take time for arrangement.",
          "If any sightseeing place is not covered (due to any alternation from our side) as per mentioned day, it will be covered in alternative day.",
          "If any place is closed/no entry on mentioned day, it will be omitted from itinerary and no refund will be made.",
        ],
      },
    ],
  },
  {
    heading: "Guest Responsibilities",
    blocks: [
      {
        type: "ul",
        items: [
          "Guests must provide accurate and complete information when making bookings.",
          "Guests need to produce Govt issued ID card during check-in at hotel/homestay.",
          "For special areas like north Sikkim / Nathula / Tsomgo Lake requires permit. Guests are requested to carry passport sized photographs and photocopies of Govt issued ID card while travelling. Aadhaar is not acceptable in Sikkim.",
          "Guests must comply with all applicable laws and regulations when using our services.",
          "Guests must not damage homestay / hotel / cab property. If found, necessary actions will be taken.",
        ],
      },
    ],
  },
  {
    heading: "Booking and Payment",
    blocks: [
      {
        type: "ul",
        items: [
          "Booking Confirmation: Upon booking, you will receive a confirmation email with the details of your booking.",
          {
            text: "Payment:",
            sub: [
              "30% of the total package amount has to be paid to confirm the booking",
              "50% of the balance payment to be made on 1st day after checkin at hotel/homestay",
              "Rest 50% to be paid within the trip period",
              "Full payment must be cleared before last day of the trip",
            ],
          },
          "Cancellation and Refunds: Please refer to the Refund and Cancellation Policy for detailed information.",
        ],
      },
    ],
  },
  {
    heading: "Liability",
    blocks: [
      {
        type: "ul",
        items: [
          "Service Quality: We strive to ensure the accuracy of the information on our website, but we cannot guarantee that all details are error-free. The quality of services provided by hotels and tour operators is their responsibility.",
          "Limitation of Liability: Indie Quickend LLP will not be liable for any direct, indirect, incidental, or consequential damages arising from use of services.",
        ],
      },
    ],
  },
  {
    heading: "Governing Law",
    blocks: [
      {
        type: "p",
        text: "These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in India.",
      },
    ],
  },
  {
    heading: "Modifications to Terms",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to modify these terms and conditions at any time. Any changes will be effective immediately upon posting on our website. Your continued use of our services after such changes constitutes your acceptance of the new terms.",
      },
    ],
  },
  {
    heading: "Contact Us",
    blocks: [
      { type: "p", text: "If you have any questions about these Terms & Conditions, please contact us at:" },
      { type: "p", text: "Email: contact@quicktrails.com" },
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }]} />
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-balance">Terms of Service</h1>
          <LegalContent sections={sections} />
        </div>
      </div>
      <Footer />
    </>
  );
}
