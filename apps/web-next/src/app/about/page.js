import { Award, Users, Globe, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "About Us",
  description: "Learn about QuickTrails -- a travel agency curating handpicked properties and tour packages across India.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Heart,
    title: "Passion for travel",
    description:
      "We believe travel transforms lives. Every journey we curate is designed to create meaningful connections and lasting memories.",
  },
  {
    icon: Award,
    title: "Quality first",
    description:
      "We handpick every property and experience, ensuring they meet our high standards for comfort, authenticity, and value.",
  },
  {
    icon: Users,
    title: "Customer focused",
    description:
      "Your satisfaction drives everything we do. From planning to execution, we are committed to making your journey seamless.",
  },
  {
    icon: Globe,
    title: "Local expertise",
    description:
      "Our deep knowledge of India's diverse regions helps us craft authentic experiences that go beyond typical tourist trails.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">About QuickTrails</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-16 leading-relaxed">
            QuickTrails curates handpicked properties and travel packages across India, helping travelers
            discover unforgettable experiences without the hassle of planning every detail themselves.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{value.title}</h2>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
