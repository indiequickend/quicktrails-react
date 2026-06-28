import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { getBrandSettings } from "@/lib/actions/brand-settings";
import { getPublicDestinations } from "@/lib/actions/destinations";

// lucide-react dropped brand/logo icons (trademark reasons) -- small inline
// SVGs instead of pulling in a separate brand-icon package for three links.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L22.8 22h-6.9l-5.4-7-6.2 7H1l8.1-9.3L1.5 2h7l4.9 6.4L18.9 2Z" />
    </svg>
  );
}

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const [brandSettings, allDestinations] = await Promise.all([
    getBrandSettings().catch(() => null),
    getPublicDestinations().catch(() => []),
  ]);
  const logoUrl = brandSettings?.primaryLogoUrl || null;
  // Show only top-level regions in the footer (max 6) to keep it concise
  const footerDestinations = allDestinations.filter((d) => !d.parentSlug).slice(0, 6);

  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="QuickTrails Logo" className="h-[50px] w-auto object-contain" />
              ) : (
                <Image src="/quicktrails-logo.png" alt="QuickTrails Logo" width={175} height={75} />
              )}
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              Discover handpicked properties and curated travel experiences across India. Your journey begins here.
            </p>
            <div className="flex space-x-3">
              <a href="https://fb.me/quicktrails" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/quicktrails" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a> */}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-primary transition-colors">Properties</Link></li>
              <li><Link href="/tour-packages" className="text-slate-400 hover:text-primary transition-colors">Packages</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Destinations</h3>
            {footerDestinations.length > 0 ? (
              <ul className="space-y-3">
                {footerDestinations.map((dest) => (
                  <li key={dest._id}>
                    <Link href={`/destination/${dest.slug}`} className="text-slate-400 hover:text-primary transition-colors">
                      {dest.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/destinations" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                    View all →
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3">
                <li><Link href="/destinations" className="text-slate-400 hover:text-primary transition-colors">Explore destinations</Link></li>
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">+91 89105 69649</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">contact@quicktrails.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">205, Indira Gandhi Road, Konnagar, Hooghly- 712235</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-slate-400 hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400">
            {currentYear} QuickTrails. Crafted with passion for travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
