"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/destinations", label: "Destinations" },
  { path: "/properties", label: "Properties" },
  { path: "/tour-packages", label: "Packages" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

// `transparent`: only true for pages with a full-bleed dark hero behind the
// header (currently just the homepage). Everywhere else the header sits
// directly on a white page background from scroll position 0, so it needs
// to render solid (white bg + dark text) immediately rather than waiting
// for `scrolled` -- otherwise white-on-white nav items disappear.
export default function Header({ transparent = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandLogoUrl, setBrandLogoUrl] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/brand-logo').then(r => r.json()).then(data => {
      if (data.logoUrl) setBrandLogoUrl(data.logoUrl);
    }).catch(() => { });
  }, []);

  // Close the mobile menu on navigation by deriving it during render
  // (the "adjust state during render" pattern) instead of an effect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  // Solid = white/blurred background with dark text. Only skipped when this
  // header is the transparent-hero variant and the page hasn't been scrolled.
  const solid = !transparent || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${solid ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2 group">
            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="QuickTrails Logo" className="h-[35px] w-auto object-contain" />
            ) : (
              <Image src="/quicktrails-logo.png" alt="QuickTrails Logo" width={172} height={35} />
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === link.path
                  ? "text-primary bg-primary/10"
                  : solid
                    ? "text-foreground hover:text-primary hover:bg-muted"
                    : "text-white hover:text-primary hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            className={`md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted ${solid ? "text-foreground" : "text-white"
              }`}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:bg-muted"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
