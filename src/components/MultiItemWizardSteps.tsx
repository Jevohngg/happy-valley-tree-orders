import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Check, Package, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { StandItem, WreathItem } from '../App';

type Stand = Database['public']['Tables']['stands']['Row'];
type Wreath = Database['public']['Tables']['wreaths']['Row'];

interface StandStepProps {
  existingStands: StandItem[];
  onUpdate: (stands: StandItem[]) => void;
}

export function StandStep({ existingStands, onUpdate }: StandStepProps) {
  const [stands, setStands] = useState<Stand[]>([]);
  const [cart, setCart] = useState<StandItem[]>(existingStands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStands();
  }, []);

  async function loadStands() {
    const { data } = await supabase
      .from('stands')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data) {
      setStands(data);
      setLoading(false);
    }
  }

  function getStandQuantity(standId: string): number {
    const item = cart.find(item => item.id === standId);
    return item ? item.quantity : 0;
  }

  function updateStandQuantity(stand: Stand, newQuantity: number) {
    const cartWithoutOwn = cart.filter(item => !item.hasOwn);

    if (newQuantity <= 0) {
      const newCart = cartWithoutOwn.filter(item => item.id !== stand.id);
      setCart(newCart);
      onUpdate(newCart);
      return;
    }

    const existingIndex = cartWithoutOwn.findIndex(item => item.id === stand.id);

    if (existingIndex >= 0) {
      cartWithoutOwn[existingIndex].quantity = newQuantity;
      setCart(cartWithoutOwn);
      onUpdate(cartWithoutOwn);
    } else {
      const newStandItem: StandItem = {
        id: stand.id,
        title: stand.title,
        unitPrice: stand.price,
        quantity: newQuantity,
        hasOwn: false,
      };
      const newCart = [...cartWithoutOwn, newStandItem];
      setCart(newCart);
      onUpdate(newCart);
    }
  }

  function toggleOwnStand() {
    if (hasOwnStand) {
      const newCart: StandItem[] = [];
      setCart(newCart);
      onUpdate(newCart);
    } else {
      const ownStandItem: StandItem = {
        id: null,
        title: 'Own Stand',
        unitPrice: 0,
        quantity: 1,
        hasOwn: true,
      };
      setCart([ownStandItem]);
      onUpdate([ownStandItem]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const hasOwnStand = cart.some(item => item.hasOwn);
  const hasPurchasedStands = cart.some(item => !item.hasOwn);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-4xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Tree Stands</h2>
            <p className="text-sm md:text-base text-slate-600">Choose to use your own stand or purchase stands from us</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={toggleOwnStand}
              className={`w-full text-left p-4 border rounded transition-colors ${
                hasOwnStand
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">I have my own stand</div>
                  <div className="text-sm text-slate-600 mt-1">No additional charge</div>
                </div>
                {hasOwnStand ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-slate-300 rounded" />
                )}
              </div>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-slate-500">OR</span>
              </div>
            </div>

            {stands.map((stand) => {
              const quantity = getStandQuantity(stand.id);
              const isSelected = quantity > 0;

              return (
                <div
                  key={stand.id}
                  className={`p-4 border rounded transition-colors ${
                    isSelected
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{stand.title}</div>
                      {stand.description && (
                        <div className="text-sm text-slate-600 mt-1">
                          {stand.description}
                        </div>
                      )}
                      {stand.fits_up_to_feet && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Fits trees up to {stand.fits_up_to_feet} feet
                        </div>
                      )}
                    </div>
                    <div className="text-base font-semibold text-slate-900">${stand.price.toFixed(2)}</div>
                  </div>

                  {isSelected ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateStandQuantity(stand, quantity - 1)}
                          className="p-1.5 border border-slate-300 rounded hover:bg-white transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-center">
                          Qty: {quantity}
                        </span>
                        <button
                          onClick={() => updateStandQuantity(stand, quantity + 1)}
                          className="p-1.5 border border-slate-300 rounded hover:bg-white transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-semibold text-slate-900 flex items-center">
                        ${(stand.price * quantity).toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateStandQuantity(stand, 1)}
                      className="w-full py-2 px-4 border border-slate-300 rounded hover:border-slate-400 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-900 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Stand
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {hasPurchasedStands && (
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">Stands Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

interface AddonsStepProps {
  existingWreaths: WreathItem[];
  onUpdate: (wreaths: WreathItem[]) => void;
}

export function AddonsStep({ existingWreaths, onUpdate }: AddonsStepProps) {
  const [wreaths, setWreaths] = useState<Wreath[]>([]);
  const [cart, setCart] = useState<WreathItem[]>(existingWreaths);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWreaths();
  }, []);

  async function loadWreaths() {
    const { data } = await supabase
      .from('wreaths')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data) {
      setWreaths(data);
      setLoading(false);
    }
  }

  function getWreathQuantity(wreathId: string): number {
    const item = cart.find(item => item.id === wreathId);
    return item ? item.quantity : 0;
  }

  function updateWreathQuantity(wreath: Wreath, newQuantity: number) {
    if (newQuantity <= 0) {
      const newCart = cart.filter(item => item.id !== wreath.id);
      setCart(newCart);
      onUpdate(newCart);
      return;
    }

    const existingIndex = cart.findIndex(item => item.id === wreath.id);

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQuantity;
      setCart(updatedCart);
      onUpdate(updatedCart);
    } else {
      const newWreathItem: WreathItem = {
        id: wreath.id,
        title: wreath.title,
        unitPrice: wreath.price,
        quantity: newQuantity,
      };
      const newCart = [...cart, newWreathItem];
      setCart(newCart);
      onUpdate(newCart);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-4xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Wreaths & Add-ons</h2>
            <p className="text-sm md:text-base text-slate-600">Add wreaths to your order or skip to continue</p>
          </div>

          <div className="space-y-3">
            {wreaths.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No wreaths available at this time
              </div>
            ) : (
              wreaths.map((wreath) => {
                const quantity = getWreathQuantity(wreath.id);
                const isSelected = quantity > 0;

                return (
                  <div
                    key={wreath.id}
                    className={`p-4 border rounded transition-colors ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{wreath.title}</div>
                        {wreath.description && (
                          <div className="text-sm text-slate-600 mt-1">{wreath.description}</div>
                        )}
                      </div>
                      <div className="text-base font-semibold text-slate-900">${wreath.price.toFixed(2)}</div>
                    </div>

                    {isSelected ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateWreathQuantity(wreath, quantity - 1)}
                            className="p-1.5 border border-slate-300 rounded hover:bg-white transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium text-slate-900 min-w-[3rem] text-center">
                            Qty: {quantity}
                          </span>
                          <button
                            onClick={() => updateWreathQuantity(wreath, quantity + 1)}
                            className="p-1.5 border border-slate-300 rounded hover:bg-white transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="font-semibold text-slate-900 flex items-center">
                          ${(wreath.price * quantity).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateWreathQuantity(wreath, 1)}
                        className="w-full py-2 px-4 border border-slate-300 rounded hover:border-slate-400 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-900 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Wreath
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">Wreaths Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
