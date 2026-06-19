import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Same workaround as the admin layout: this page calls client hooks internally
// (via Header), so we skip prerendering entirely.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "404 – Page not found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </main>
      <Footer />
    </>
  );
}
