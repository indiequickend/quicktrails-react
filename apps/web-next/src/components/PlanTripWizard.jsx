'use client';

import { useState } from 'react';
import { submitSelfPlan } from '@/lib/actions/selfPlan';
import { Plus, X, ChevronRight, ChevronLeft, Check, Car, Bed, Users, CalendarDays, MapPin, Tag, Wind } from 'lucide-react';

const CAR_TYPES = ['WagonR', 'Dzire', 'Bolero', 'Sumo', 'Ertiga / Innova / Xylo', 'Traveller'];
const STAY_OPTIONS = [
  { value: 'budget', label: 'Budget', desc: 'Guesthouses & basic hotels' },
  { value: 'standard', label: 'Standard', desc: 'Mid-range hotels & resorts' },
  { value: 'premium', label: 'Premium', desc: 'Luxury stays & boutique resorts' },
];
const BUDGET_MINS = { per_night: 3000, per_head_per_day: 1200 };

function ACToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium shrink-0">
      <button type="button" onClick={() => onChange(true)}
        className={`px-2.5 py-1.5 flex items-center gap-1 transition ${value ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
        <Wind className="w-3 h-3" /> AC
      </button>
      <button type="button" onClick={() => onChange(false)}
        className={`px-2.5 py-1.5 transition ${!value ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
        Non-AC
      </button>
    </div>
  );
}

function DiscountBadge({ discount }) {
  if (!discount?.enabled || !discount?.value) return null;
  const text = discount.type === 'percentage'
    ? `${discount.value}% off your trip`
    : `₹${discount.value.toLocaleString('en-IN')} off your trip`;
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2.5 rounded-xl mb-6">
      <Tag className="w-4 h-4 shrink-0 text-green-600" />
      <span>Self-plan discount: <strong>{text}</strong> — applied to your final quote</span>
    </div>
  );
}

function StepIndicator({ step }) {
  const steps = ['Trip details', 'Stay & vehicle', 'Your info'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                ${done ? 'bg-green-500 text-white' : active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Counter({ value, onChange, min = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg font-medium hover:bg-muted">−</button>
      <span className="text-base font-semibold w-6 text-center">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg font-medium hover:bg-muted">+</button>
    </div>
  );
}

export default function PlanTripWizard({ destinations: dbDestinations, discount, prefillDestination }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Step 1
  const [selectedDestinations, setSelectedDestinations] = useState(
    prefillDestination ? [prefillDestination] : []
  );
  const [customDest, setCustomDest] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [foodVeg, setFoodVeg] = useState(0);
  const [foodNonVeg, setFoodNonVeg] = useState(0);

  // Step 2
  const [stayPref, setStayPref] = useState('');
  const [rooms, setRooms] = useState([{ adults: 2, children: 0, ac: true }]);
  // Derived pool: track how many adults/children are unallocated across rooms
  const allocatedAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const allocatedChildren = rooms.reduce((s, r) => s + r.children, 0);
  const remainingAdults = adults - allocatedAdults;
  const remainingChildren = children - allocatedChildren;
  const remaining = remainingAdults + remainingChildren;
  const [stayBudgetType, setStayBudgetType] = useState('per_night');
  const [stayBudgetAmount, setStayBudgetAmount] = useState('');
  const [carType, setCarType] = useState('');
  const [carAC, setCarAC] = useState(true);
  const [numCars, setNumCars] = useState(1);

  // Step 3
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [step1Error, setStep1Error] = useState('');
  const [step2Error, setStep2Error] = useState('');
  const [step3Error, setStep3Error] = useState('');

  const updateRoom = (idx, field, val) => {
    if (field === 'ac') {
      setRooms(rooms.map((r, i) => i === idx ? { ...r, ac: val } : r));
      return;
    }
    const room = rooms[idx];
    const newVal = Math.max(0, val);
    const increasing = newVal > room[field];
    const newTotal = field === 'adults' ? newVal + room.children : room.adults + newVal;

    if (increasing) {
      // Check remaining pool for this type
      if (field === 'adults' && remainingAdults <= 0) return;
      if (field === 'children' && remainingChildren <= 0) return;
    } else {
      // Can't go below min 2 per room
      if (newTotal < 2) return;
      // Adults can't go below 1
      if (field === 'adults' && newVal < 1) return;
    }
    setRooms(rooms.map((r, i) => i === idx ? { ...r, [field]: newVal } : r));
  };

  const addRoom = () => {
    if (remainingAdults + remainingChildren < 2) return;
    const newAdults = Math.min(2, remainingAdults);
    const newChildren = 2 - newAdults > 0 ? Math.min(2 - newAdults, remainingChildren) : 0;
    setRooms([...rooms, { adults: newAdults, children: newChildren, ac: true }]);
  };

  const removeRoom = (idx) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const addDestination = (dest) => {
    if (dest && !selectedDestinations.includes(dest))
      setSelectedDestinations([...selectedDestinations, dest]);
  };
  const removeDestination = (dest) => setSelectedDestinations(selectedDestinations.filter((d) => d !== dest));

  const nights = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;

  const budgetMin = BUDGET_MINS[stayBudgetType];
  const budgetInvalid = stayBudgetAmount && Number(stayBudgetAmount) < budgetMin;

  const goNext = () => {
    if (step === 1) {
      if (!selectedDestinations.length) return setStep1Error('Add at least one destination.');
      if (!startDate || !endDate) return setStep1Error('Select your travel dates.');
      if (new Date(endDate) <= new Date(startDate)) return setStep1Error('End date must be after start date.');
      if (adults < 1) return setStep1Error('At least 1 adult required.');
      setStep1Error('');
      // Reinitialise rooms if group size changed since last visit
      const totalGroup = adults + children;
      const currentAllocated = rooms.reduce((s, r) => s + r.adults + r.children, 0);
      if (currentAllocated !== totalGroup) {
        setRooms([{ adults, children, ac: true }]);
      }
    }
    if (step === 2) {
      if (remaining > 0) return setStep2Error(`Distribute all ${remaining} person${remaining !== 1 ? 's' : ''} into rooms before continuing.`);
      if (!carType) return setStep2Error('Please select a vehicle type.');
      if (budgetInvalid) return setStep2Error(`Minimum budget is ₹${budgetMin.toLocaleString('en-IN')} ${stayBudgetType === 'per_head_per_day' ? 'per head/day' : 'per night'}.`);
      setStep2Error('');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      return setStep3Error('Name, phone and email are required.');
    }
    setStep3Error('');
    setSubmitting(true);
    const res = await submitSelfPlan({
      guestName: name, email, phone,
      destinations: selectedDestinations,
      startDate, endDate,
      adults, childrenUnder8: children,
      stayPreference: stayPref,
      stayBudgetAmount: stayBudgetAmount || null,
      stayBudgetType,
      rooms,
      foodVeg, foodNonVeg,
      carType, carAC, numberOfCars: numCars,
      specialRequests: notes,
    });
    setSubmitting(false);
    setResult(res);
  };

  if (result?.success) {
    const ds = result.discountSnapshot;
    const hasDiscount = ds?.type !== 'none' && ds?.value > 0;
    const discountText = hasDiscount
      ? (ds.type === 'percentage' ? `${ds.value}% off` : `₹${ds.value.toLocaleString('en-IN')} off`)
      : null;
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">We've got your plan!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Our team will review your itinerary and get back to you within 24 hours with a detailed quote.
        </p>
        {hasDiscount && (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 font-semibold px-5 py-3 rounded-xl">
            <Tag className="w-5 h-5" />
            Your <strong>{discountText} self-plan discount</strong> is locked in — we'll apply it to your quote.
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Check your inbox for a confirmation. You can also reach us on WhatsApp for a faster response.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DiscountBadge discount={discount} />
      <StepIndicator step={step} />

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Destinations</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedDestinations.map((d) => (
                <span key={d} className="flex items-center gap-1.5 bg-slate-100 text-slate-800 text-sm px-3 py-1.5 rounded-full font-medium">
                  {d}
                  <button type="button" onClick={() => removeDestination(d)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            {dbDestinations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {dbDestinations
                  .filter((d) => !selectedDestinations.includes(d.name))
                  .map((d) => (
                    <button key={d._id} type="button" onClick={() => addDestination(d.name)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-slate-400 hover:bg-slate-50 transition text-slate-600">
                      + {d.name}
                    </button>
                  ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={customDest} onChange={(e) => setCustomDest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && customDest.trim()) { addDestination(customDest.trim()); setCustomDest(''); } }}
                placeholder="Type a destination not listed above..."
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <button type="button" onClick={() => { if (customDest.trim()) { addDestination(customDest.trim()); setCustomDest(''); } }}
                className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> Start date</label>
              <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End date</label>
              <input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>
          {nights > 0 && <p className="text-sm text-muted-foreground -mt-3">{nights} night{nights !== 1 ? 's' : ''}</p>}

          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="w-4 h-4" /> Group size</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Adults</span>
                <Counter value={adults} onChange={setAdults} min={1} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Children under 8</span>
                <Counter value={children} onChange={setChildren} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Food preference</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Veg</span>
                <Counter value={foodVeg} onChange={setFoodVeg} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Non-veg</span>
                <Counter value={foodNonVeg} onChange={setFoodNonVeg} />
              </div>
            </div>
          </div>

          {step1Error && <p className="text-sm text-red-600">{step1Error}</p>}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Bed className="w-4 h-4" /> Type of stay</label>
            <div className="grid grid-cols-3 gap-3">
              {STAY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setStayPref(opt.value === stayPref ? '' : opt.value)}
                  className={`text-left p-3 rounded-xl border-2 transition ${stayPref === opt.value ? 'border-slate-900 bg-slate-50' : 'border-border hover:border-slate-300'}`}>
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold flex items-center gap-1.5"><Bed className="w-4 h-4" /> Room configuration</label>
              {remaining > 0 && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  {remaining} person{remaining !== 1 ? 's' : ''} to allocate
                </span>
              )}
              {remaining === 0 && (
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  All {adults + children} person{adults + children !== 1 ? 's' : ''} allocated
                </span>
              )}
            </div>
            <div className="space-y-2 mb-3">
              {rooms.map((room, idx) => {
                const roomTotal = room.adults + room.children;
                const canDecAdults = room.adults > 1 && roomTotal > 2;
                const canDecChildren = room.children > 0 && roomTotal > 2;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 py-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 w-14 shrink-0">Room {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Adults</span>
                      <button type="button" onClick={() => updateRoom(idx, 'adults', room.adults - 1)}
                        disabled={!canDecAdults}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                      <span className="text-sm font-semibold w-4 text-center">{room.adults}</span>
                      <button type="button" onClick={() => updateRoom(idx, 'adults', room.adults + 1)}
                        disabled={remainingAdults <= 0}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                    </div>
                    {children > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Children</span>
                        <button type="button" onClick={() => updateRoom(idx, 'children', room.children - 1)}
                          disabled={!canDecChildren}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                        <span className="text-sm font-semibold w-4 text-center">{room.children}</span>
                        <button type="button" onClick={() => updateRoom(idx, 'children', room.children + 1)}
                          disabled={remainingChildren <= 0}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                      </div>
                    )}
                    <ACToggle value={room.ac} onChange={(v) => updateRoom(idx, 'ac', v)} />
                    {rooms.length > 1 && (
                      <button type="button" onClick={() => removeRoom(idx)} className="ml-auto text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {remaining >= 2 && (
              <button type="button" onClick={addRoom}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <Plus className="w-4 h-4" /> Add another room
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Stay budget <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
            <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium mb-3 w-fit">
              {[{ value: 'per_night', label: 'Per night' }, { value: 'per_head_per_day', label: 'Per head / day' }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => { setStayBudgetType(opt.value); setStayBudgetAmount(''); }}
                  className={`px-4 py-2 transition ${stayBudgetType === opt.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">₹</span>
              <input type="number" value={stayBudgetAmount} min={budgetMin}
                onChange={(e) => setStayBudgetAmount(e.target.value)}
                placeholder={`Min ₹${budgetMin.toLocaleString('en-IN')}`}
                className={`w-44 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${budgetInvalid ? 'border-red-400' : 'border-border'}`} />
              <span className="text-sm text-muted-foreground">
                {stayBudgetType === 'per_head_per_day' ? 'per head / day' : 'per night'}
              </span>
            </div>
            {budgetInvalid && (
              <p className="text-xs text-red-500 mt-1">Minimum is ₹{budgetMin.toLocaleString('en-IN')} {stayBudgetType === 'per_head_per_day' ? 'per head/day' : 'per night'}</p>
            )}
            {stayBudgetType === 'per_head_per_day' && !budgetInvalid && (
              <p className="text-xs text-muted-foreground mt-1">Includes food &amp; lodging for one person per day</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Car className="w-4 h-4" /> Vehicle type</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CAR_TYPES.map((ct) => (
                <button key={ct} type="button" onClick={() => setCarType(ct === carType ? '' : ct)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${carType === ct ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-border hover:border-slate-400'}`}>
                  {ct}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">AC preference:</span>
              <ACToggle value={carAC} onChange={setCarAC} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Number of vehicles</label>
            <Counter value={numCars} onChange={setNumCars} min={1} />
          </div>

          {step2Error && <p className="text-sm text-red-600">{step2Error}</p>}
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5 text-slate-700 border border-slate-200">
            <p><strong>Destinations:</strong> {selectedDestinations.join(' → ')}</p>
            <p><strong>Dates:</strong> {new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – {new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({nights} nights)</p>
            <p><strong>Group:</strong> {adults} adult{adults !== 1 ? 's' : ''}{children ? `, ${children} child${children !== 1 ? 'ren' : ''} under 8` : ''}</p>
            {(foodVeg > 0 || foodNonVeg > 0) && <p><strong>Food:</strong> Veg {foodVeg}, Non-veg {foodNonVeg}</p>}
            {stayPref && <p><strong>Stay:</strong> {stayPref.charAt(0).toUpperCase() + stayPref.slice(1)}</p>}
            <p><strong>Rooms:</strong> {rooms.map((r, i) => `R${i + 1}: ${r.adults}A${r.children ? `+${r.children}C` : ''} · ${r.ac ? 'AC' : 'Non-AC'}`).join(', ')}</p>
            {stayBudgetAmount && <p><strong>Budget:</strong> ₹{Number(stayBudgetAmount).toLocaleString('en-IN')} {stayBudgetType === 'per_head_per_day' ? 'per head/day' : 'per night'}</p>}
            <p><strong>Vehicle:</strong> {carType} × {numCars} ({carAC ? 'AC' : 'Non-AC'})</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Full name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">WhatsApp / Phone <span className="text-red-500">*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Additional notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Any special requests, dietary needs, accessibility requirements..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
          </div>

          {step3Error && <p className="text-sm text-red-600">{step3Error}</p>}
        </div>
      )}

      <div className={`flex mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
        {step > 1 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={goNext}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Get my quote'}
            {!submitting && <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
