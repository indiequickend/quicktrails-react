import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlanTripWizard from '@/components/PlanTripWizard';
import TrackPageView from '@/components/TrackPageView';
import { getPublicDestinations } from '@/lib/actions/destinations';
import { getSiteConfig } from '@/lib/actions/siteConfig';
import { SITE_URL } from '@/lib/constants';

export const metadata = {
  title: 'Plan Your Own Trip | QuickTrails',
  description: 'Build your own custom itinerary and get an exclusive discount. Tell us your destinations, dates, group size, and travel preferences — we handle the rest.',
  alternates: { canonical: `${SITE_URL}/plan-your-trip` },
};

export default async function PlanYourTripPage({ searchParams }) {
  const [destinations, config, resolvedParams] = await Promise.all([
    getPublicDestinations(),
    getSiteConfig(),
    Promise.resolve(searchParams),
  ]);

  const prefill = resolvedParams?.destination || '';

  return (
    <>
      <Header />
      <TrackPageView path="/plan-your-trip" refType="page" />
      <main className="min-h-screen bg-muted pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>Plan your own trip</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Tell us where you want to go, when, and how. We'll send you a personalised quote within 24 hours.
            </p>
          </div>

          <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <PlanTripWizard
              destinations={destinations}
              discount={config?.selfPlanDiscount}
              prefillDestination={prefill}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
