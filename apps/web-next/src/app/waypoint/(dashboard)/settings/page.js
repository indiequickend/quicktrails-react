'use client';

import { useState, useEffect } from 'react';
import { getSiteConfig, updateSelfPlanDiscount } from '@/lib/actions/siteConfig';

export default function AdminSettingsPage() {
  const [discount, setDiscount] = useState({ enabled: false, type: 'percentage', value: 5 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteConfig().then((config) => {
      if (config?.selfPlanDiscount) setDiscount(config.selfPlanDiscount);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    const res = await updateSelfPlanDiscount(discount);
    if (res.success) setSaved(true);
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Site Settings</h1>
      <p className="text-muted-foreground mb-8">Configure site-wide features and promotions.</p>

      <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl space-y-8">

        {/* Self-Plan Discount */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold">Self-Plan Trip Discount</h2>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm text-muted-foreground">{discount.enabled ? 'Enabled' : 'Disabled'}</span>
              <button
                type="button"
                role="switch"
                aria-checked={discount.enabled}
                onClick={() => setDiscount(d => ({ ...d, enabled: !d.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${discount.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${discount.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            When enabled, this discount is shown to visitors who submit their own trip plan via <strong>/plan-your-trip</strong>. It is applied to their final quoted price.
          </p>

          <div className={`space-y-5 ${!discount.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <div className="flex gap-3">
                {['percentage', 'fixed'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiscount(d => ({ ...d, type: t }))}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${discount.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-border hover:border-slate-400'}`}
                  >
                    {t === 'percentage' ? '% Percentage off total' : '₹ Fixed amount off total'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {discount.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{discount.type === 'percentage' ? '' : '₹'}</span>
                <input
                  type="number"
                  min="0"
                  max={discount.type === 'percentage' ? 100 : undefined}
                  value={discount.value}
                  onChange={(e) => setDiscount(d => ({ ...d, value: Number(e.target.value) }))}
                  className="w-32 p-2 border border-border rounded focus:outline-none text-sm"
                />
                {discount.type === 'percentage' && <span className="text-muted-foreground text-sm">%</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {discount.type === 'percentage'
                  ? `Visitors will see "Get ${discount.value}% off your trip"`
                  : `Visitors will see "Get ₹${discount.value.toLocaleString('en-IN')} off your trip"`}
              </p>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-border flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}
