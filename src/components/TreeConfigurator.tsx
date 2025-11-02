import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { TreeItem } from '../App';

type Species = Database['public']['Tables']['species']['Row'];
type FullnessVariant = Database['public']['Tables']['fullness_variants']['Row'];
type SpeciesHeight = Database['public']['Tables']['species_heights']['Row'];

interface ConfiguratorProps {
  existingTrees: TreeItem[];
  onUpdate: (trees: TreeItem[]) => void;
}

const FULLNESS_ORDER: ('thin' | 'medium' | 'full')[] = ['thin', 'medium', 'full'];

export function TreeConfigurator({ existingTrees, onUpdate }: ConfiguratorProps) {
  const [species, setSpecies] = useState<Species[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variants, setVariants] = useState<FullnessVariant[]>([]);
  const [heights, setHeights] = useState<SpeciesHeight[]>([]);
  const [selectedFullness, setSelectedFullness] = useState<'thin' | 'medium' | 'full'>('medium');
  const [selectedHeight, setSelectedHeight] = useState<number>(7);
  const [quantity, setQuantity] = useState<number>(1);
  const [freshCut, setFreshCut] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<TreeItem[]>(existingTrees);

  useEffect(() => {
    loadSpecies();
  }, []);

  useEffect(() => {
    if (species.length > 0) {
      loadVariantsAndHeights(species[currentIndex].id);
    }
  }, [currentIndex, species]);

  async function loadSpecies() {
    const { data } = await supabase
      .from('species')
      .select('*')
      .eq('visible', true)
      .order('sort_order');

    if (data && data.length > 0) {
      setSpecies(data);
      setLoading(false);
    }
  }

  async function loadVariantsAndHeights(speciesId: string) {
    const [variantsRes, heightsRes] = await Promise.all([
      supabase
        .from('fullness_variants')
        .select('*')
        .eq('species_id', speciesId)
        .eq('available', true)
        .order('fullness_type'),
      supabase
        .from('species_heights')
        .select('*')
        .eq('species_id', speciesId)
        .eq('available', true)
        .order('height_feet'),
    ]);

    if (variantsRes.data) {
      setVariants(variantsRes.data as any);
      if (variantsRes.data.length > 0) {
        const mediumVariant = (variantsRes.data as any).find((v: any) => v.fullness_type === 'medium');
        setSelectedFullness((mediumVariant?.fullness_type || (variantsRes.data as any)[0].fullness_type) as 'thin' | 'medium' | 'full');
      }
    }

    if (heightsRes.data) {
      setHeights(heightsRes.data as any);
      if (heightsRes.data.length > 0) {
        const defaultHeight = (heightsRes.data as any).find((h: any) => h.height_feet === 7) || (heightsRes.data as any)[0];
        setSelectedHeight(defaultHeight.height_feet);
      }
    }
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : species.length - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev < species.length - 1 ? prev + 1 : 0));
  }

  function addToCart() {
    const currentSpecies = species[currentIndex];
    const variant = variants.find(v => v.fullness_type === selectedFullness);

    if (currentSpecies && variant) {
      const unitPrice = variant.price_per_foot * selectedHeight;

      const newTree: TreeItem = {
        speciesId: currentSpecies.id,
        speciesName: currentSpecies.name,
        fullness: selectedFullness,
        height: selectedHeight,
        pricePerFoot: variant.price_per_foot,
        unitPrice,
        quantity,
        freshCut,
        imageUrl: variant.image_url,
      };

      const newCart = [...cart, newTree];
      setCart(newCart);
      onUpdate(newCart);
      setQuantity(1);
      setFreshCut(false);
    }
  }

  function removeFromCart(index: number) {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    onUpdate(newCart);
  }

  function updateQuantity(index: number, newQuantity: number) {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    onUpdate(updatedCart);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (species.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">No species available</div>
      </div>
    );
  }

  const currentSpecies = species[currentIndex];
  const currentVariant = variants.find(v => v.fullness_type === selectedFullness);
  const treePrice = currentVariant ? currentVariant.price_per_foot * selectedHeight : 0;
  const totalPrice = treePrice * quantity;
  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const sortedVariants = [...variants].sort((a, b) => {
    return FULLNESS_ORDER.indexOf(a.fullness_type as any) - FULLNESS_ORDER.indexOf(b.fullness_type as any);
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{currentSpecies.name}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <div className="relative bg-slate-50 border border-slate-200 rounded-t overflow-hidden aspect-square">
                {currentVariant && (
                  <img
                    src={currentVariant.image_url}
                    alt={`${currentSpecies.name} - ${selectedFullness}`}
                    className="w-full h-full object-contain"
                  />
                )}

                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-slate-900" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              <div className="bg-amber-50 border-x border-b border-amber-200 rounded-b px-2.5 py-1.5">
                <p className="text-[10px] text-amber-900 leading-snug">
                  <span className="font-semibold">Image for reference only.</span> Actual trees vary naturally. We'll match your preferences based on availability.
                </p>
              </div>
            </div>

            <div className="text-slate-600 text-sm leading-relaxed">
              {currentSpecies.description}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Fullness</label>
                <div className="grid grid-cols-3 gap-2">
                  {sortedVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedFullness(variant.fullness_type as 'thin' | 'medium' | 'full')}
                      className={`py-2 px-3 border rounded transition-colors capitalize text-sm font-medium ${
                        selectedFullness === variant.fullness_type
                          ? 'border-primary-800 bg-slate-50 text-slate-900'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      {variant.fullness_type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Height
                  {currentVariant && (
                    <span className="ml-2 text-slate-600 font-normal text-xs">
                      (${currentVariant.price_per_foot.toFixed(2)}/ft)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {heights.map((height) => (
                    <button
                      key={height.id}
                      onClick={() => setSelectedHeight(height.height_feet)}
                      className={`py-2 px-3 border rounded transition-colors text-sm font-medium ${
                        selectedHeight === height.height_feet
                          ? 'border-primary-800 bg-slate-50 text-slate-900'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      {height.height_feet} ft
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold text-slate-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freshCut}
                    onChange={(e) => setFreshCut(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-800 focus:ring-primary-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">
                      Fresh Cut
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      We'll cut a half inch off of the bottom of your tree fresh on the day of delivery for maximum freshness and longevity This is free of charge.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-slate-600">Price</span>
                  <span className="text-xl font-bold text-slate-900">${totalPrice.toFixed(2)}</span>
                </div>

                <button
                  onClick={addToCart}
                  className="w-full py-2.5 bg-primary-800 text-white font-medium hover:bg-primary-900 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Order
                </button>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-4 h-4 text-slate-900" />
                  <h3 className="text-sm font-semibold text-slate-900">Added Trees ({cart.length})</h3>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded p-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {item.speciesName} - {item.height} ft ({item.fullness})
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                            {item.freshCut && <span className="text-green-600"> • Fresh</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-900 whitespace-nowrap">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
