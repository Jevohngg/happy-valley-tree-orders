import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Mail, Phone, ArrowLeft, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Stand = Database['public']['Tables']['stands']['Row'];
type Wreath = Database['public']['Tables']['wreaths']['Row'];
type DeliveryOption = Database['public']['Tables']['delivery_options']['Row'];

interface StandStepProps {
  onNext: (stand: { id: string | null; name: string; price: number; hasOwn: boolean }) => void;
  onBack: () => void;
}

export function StandStep({ onNext, onBack }: StandStepProps) {
  const [stands, setStands] = useState<Stand[]>([]);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [hasOwnStand, setHasOwnStand] = useState(false);

  useEffect(() => {
    loadStands();
  }, []);

  async function loadStands() {
    const { data } = await supabase
      .from('stands')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data) setStands(data);
  }

  function handleNext() {
    if (hasOwnStand) {
      onNext({ id: null, name: 'Own Stand', price: 0, hasOwn: true });
    } else if (selectedStand) {
      const stand = stands.find(s => s.id === selectedStand);
      if (stand) {
        onNext({ id: stand.id, name: stand.name, price: stand.price, hasOwn: false });
      }
    }
  }

  const canProceed = hasOwnStand || selectedStand !== null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border rounded border-slate-200 overflow-hidden p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Tree Stand</h2>
            <p className="text-slate-600">Choose a stand or use your own</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setHasOwnStand(true);
                setSelectedStand(null);
              }}
              className={`w-full text-left p-4 border transition-colors ${
                hasOwnStand
                  ? 'border-primary-800 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="font-semibold text-slate-900">I have my own stand</div>
              <div className="text-sm text-slate-600 mt-1">No additional charge</div>
            </button>

            {stands.map((stand) => (
              <button
                key={stand.id}
                onClick={() => {
                  setSelectedStand(stand.id);
                  setHasOwnStand(false);
                }}
                className={`w-full text-left p-4 border transition-colors ${
                  selectedStand === stand.id
                    ? 'border-primary-800 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">{stand.name}</div>
                    {stand.fits_up_to_feet && (
                      <div className="text-sm text-slate-600 mt-1">
                        Fits trees up to {stand.fits_up_to_feet} feet
                      </div>
                    )}
                  </div>
                  <div className="text-base font-semibold text-slate-900">${stand.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 rounded hover:border-slate-400 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 py-2.5 bg-primary-800 text-white font-medium hover:bg-primary-900 rounded transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Continue to Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeliveryStepProps {
  selectedDelivery?: { id: string; name: string; fee: number };
  onUpdate: (delivery: { id: string; name: string; fee: number }) => void;
}

export function DeliveryStep({ selectedDelivery, onUpdate }: DeliveryStepProps) {
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedDelivery?.id || null);

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    const { data } = await supabase
      .from('delivery_options')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data && data.length > 0) {
      setOptions(data as any);
      if (!selectedOption) {
        const firstOption = (data as any)[0];
        setSelectedOption(firstOption.id);
        onUpdate({ id: firstOption.id, name: firstOption.name, fee: firstOption.fee });
      }
    }
  }

  function handleSelect(optionId: string) {
    setSelectedOption(optionId);
    const option = options.find(o => o.id === optionId);
    if (option) {
      onUpdate({ id: option.id, name: option.name, fee: option.fee });
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Delivery Service</h2>
            <p className="text-sm md:text-base text-slate-600">Choose your delivery level</p>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left p-4 border rounded transition-colors ${
                  selectedOption === option.id
                    ? 'border-primary-800 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">{option.name}</div>
                    {option.description && (
                      <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                    )}
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {option.fee === 0 ? 'Free' : `$${option.fee.toFixed(2)}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddonsStepProps {
  onNext: (wreath: { id: string; size: string; price: number } | null) => void;
  onBack: () => void;
}

export function AddonsStep({ onNext, onBack }: AddonsStepProps) {
  const [wreaths, setWreaths] = useState<Wreath[]>([]);
  const [selectedWreath, setSelectedWreath] = useState<string | null>(null);

  useEffect(() => {
    loadWreaths();
  }, []);

  async function loadWreaths() {
    const { data } = await supabase
      .from('wreaths')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data) setWreaths(data);
  }

  function handleNext() {
    if (selectedWreath) {
      const wreath = wreaths.find(w => w.id === selectedWreath);
      if (wreath) {
        onNext({ id: wreath.id, size: wreath.size, price: wreath.price });
        return;
      }
    }
    onNext(null);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border rounded border-slate-200 overflow-hidden p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Add a Wreath</h2>
            <p className="text-slate-600">Optional: Complete your holiday decor</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedWreath(null)}
              className={`w-full text-left p-4 border transition-colors ${
                selectedWreath === null
                  ? 'border-primary-800 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="font-semibold text-slate-900">No wreath, thanks</div>
              <div className="text-sm text-slate-600 mt-1">Continue without adding a wreath</div>
            </button>

            {wreaths.map((wreath) => (
              <button
                key={wreath.id}
                onClick={() => setSelectedWreath(wreath.id)}
                className={`w-full text-left p-4 border transition-colors ${
                  selectedWreath === wreath.id
                    ? 'border-primary-800 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 capitalize">{wreath.size} Wreath</div>
                  </div>
                  <div className="text-base font-semibold text-slate-900">${wreath.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 rounded hover:border-slate-400 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 bg-primary-800 text-white font-medium hover:bg-primary-900 rounded transition-colors"
            >
              Continue to Fresh Cut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FreshCutStepProps {
  onNext: (freshCut: boolean) => void;
  onBack: () => void;
}

export function FreshCutStep({ onNext, onBack }: FreshCutStepProps) {
  const [wantsFreshCut, setWantsFreshCut] = useState(false);

  function handleNext() {
    onNext(wantsFreshCut);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border rounded border-slate-200 overflow-hidden p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Fresh Cut Service</h2>
            <p className="text-slate-600">Would you like us to fresh cut your tree?</p>
          </div>

          <div className="bg-primary-50 border rounded border-primary-200 p-4">
            <div className="flex gap-2">
              <Scissors className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-900">
                <p className="font-semibold mb-2">What is a fresh cut?</p>
                <p>
                  We'll cut about half an inch off the bottom of your tree before delivery.
                  This opens up the pores so your tree can drink water better and stay fresh longer.
                  It's recommended to do this before putting the tree in water.
                </p>
                <p className="mt-2 font-semibold">This service is complimentary!</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setWantsFreshCut(true)}
              className={`w-full text-left p-4 border transition-colors ${
                wantsFreshCut
                  ? 'border-primary-800 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="font-semibold text-slate-900">Yes, please fresh cut my tree</div>
              <div className="text-sm text-slate-600 mt-1">We'll prepare your tree before delivery (Free)</div>
            </button>

            <button
              onClick={() => setWantsFreshCut(false)}
              className={`w-full text-left p-4 border transition-colors ${
                !wantsFreshCut
                  ? 'border-primary-800 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="font-semibold text-slate-900">No thanks, I'll do it myself</div>
              <div className="text-sm text-slate-600 mt-1">You can fresh cut the tree after delivery</div>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 rounded hover:border-slate-400 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 bg-primary-800 text-white font-medium hover:bg-primary-900 rounded transition-colors"
            >
              Continue to Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScheduleStepProps {
  schedule?: { date: string | null; time: string | null };
  onUpdate: (schedule: { date: string | null; time: string | null }) => void;
}

export function ScheduleStep({ schedule, onUpdate }: ScheduleStepProps) {
  const [date, setDate] = useState(schedule?.date || '');
  const [time, setTime] = useState(schedule?.time || '');

  useEffect(() => {
    onUpdate({ date: date || null, time: time || null });
  }, []);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    onUpdate({ date: newDate || null, time: time || null });
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime);
    onUpdate({ date: date || null, time: newTime || null });
  }

  const timeWindows = [
    '8:00 AM - 12:00 PM',
    '12:00 PM - 4:00 PM',
    '4:00 PM - 8:00 PM',
  ];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Delivery Schedule</h2>
            <p className="text-sm md:text-base text-slate-600">Choose your preferred delivery date and time</p>
          </div>

          <div className="bg-amber-50 border rounded border-amber-200 p-4">
            <div className="flex gap-2">
              <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Preferred times are not guaranteed. We'll do our best to accommodate your request.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <Calendar className="w-5 h-5" />
                Preferred Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={minDateString}
                className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <Clock className="w-5 h-5" />
                Preferred Time Window
              </label>
              <select
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              >
                <option value="">Select a time window</option>
                {timeWindows.map((window) => (
                  <option key={window} value={window}>
                    {window}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

interface ContactStepProps {
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  };
  onUpdate: (contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  }) => void;
}

export function ContactStep({ contact, onUpdate }: ContactStepProps) {
  const [firstName, setFirstName] = useState(contact?.firstName || '');
  const [lastName, setLastName] = useState(contact?.lastName || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [street, setStreet] = useState(contact?.street || '');
  const [unit, setUnit] = useState(contact?.unit || '');
  const [city, setCity] = useState(contact?.city || '');
  const [state, setState] = useState(contact?.state || '');
  const [zip, setZip] = useState(contact?.zip || '');
  const [notes, setNotes] = useState(contact?.notes || '');

  useEffect(() => {
    onUpdate({ firstName, lastName, email, phone, street, unit, city, state, zip, notes });
  }, [firstName, lastName, email, phone, street, unit, city, state, zip, notes]);

  const isValid = firstName && lastName && email && phone && street && city && state && zip;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Contact & Delivery Address</h2>
            <p className="text-sm md:text-base text-slate-600">We'll use this info to coordinate delivery</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <Phone className="w-4 h-4" />
                Phone (SMS capable) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                required
                className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address *"
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Apt, suite, unit (optional)"
                  className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City *"
                    required
                    className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State *"
                    required
                    className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  />
                </div>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="ZIP code *"
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Additional Information or Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions, details about access, where to place the tree, etc."
                rows={4}
                className="w-full px-4 py-2.5 bg-white border rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tell us anything you'd like us to know — such as parking details, access codes, preferred tree placement, or specific preferences for your tree’s look, size, or shape. You can also include any other notes or special requests that will help us make your experience smooth and personalized.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
