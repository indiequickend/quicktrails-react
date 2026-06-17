import { Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookingForm from "@/components/BookingForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with QuickTrails to plan your next trip, ask about a property, or request a custom tour package.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }) {
  const { property, package: packageSlug } = await searchParams;

  return (
    <>
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Get in touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-16">
            Have a question, or want help planning a trip? Send us a message and we&apos;ll get back to you within 24 hours.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>+91 89105 69649</span>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>contact@quicktrails.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>205, Indira Gandhi Road, Konnagar, West Bengal 712235</span>
              </div>
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
              <BookingForm propertySlug={property} packageSlug={packageSlug} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
