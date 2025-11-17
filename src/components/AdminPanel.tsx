import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Settings, TreePine, Package, Gift, Truck, Save, Check, Plus, X, ShoppingBag, Trash2, DollarSign } from 'lucide-react';

type Species = Database['public']['Tables']['species']['Row'];
type FullnessVariant = Database['public']['Tables']['fullness_variants']['Row'];
type SpeciesHeight = Database['public']['Tables']['species_heights']['Row'];
type Stand = Database['public']['Tables']['stands']['Row'];
type WreathType = Database['public']['Tables']['wreaths']['Row'];
type DeliveryOption = Database['public']['Tables']['delivery_options']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type OrderTree = Database['public']['Tables']['order_trees']['Row'];
type OrderStand = Database['public']['Tables']['order_stands']['Row'];
type OrderWreath = Database['public']['Tables']['order_wreaths']['Row'];

interface OrderWithItems extends Order {
  order_trees: (OrderTree & { species: Species })[];
  order_stands: (OrderStand & { stands: Stand | null })[];
  order_wreaths: (OrderWreath & { wreaths: WreathType })[];
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'species' | 'stands' | 'wreaths' | 'delivery' | 'orders'>('species');
  const [species, setSpecies] = useState<Species[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);
  const [wreaths, setWreaths] = useState<WreathType[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [speciesRes, standsRes, wreathsRes, deliveryRes, ordersRes] = await Promise.all([
      supabase.from('species').select('*').order('sort_order'),
      supabase.from('stands').select('*').order('sort_order'),
      supabase.from('wreaths').select('*').order('sort_order'),
      supabase.from('delivery_options').select('*').order('sort_order'),
      supabase.from('orders').select(`
        *,
        order_trees(*, species(*)),
        order_stands(*, stands(*)),
        order_wreaths(*, wreaths(*))
      `).order('created_at', { ascending: false }),
    ]);

    if (speciesRes.data) setSpecies(speciesRes.data);
    if (standsRes.data) setStands(standsRes.data);
    if (wreathsRes.data) setWreaths(wreathsRes.data);
    if (deliveryRes.data) setDeliveryOptions(deliveryRes.data);
    if (ordersRes.data) setOrders(ordersRes.data as OrderWithItems[]);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white rounded border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Settings className="w-6 h-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">Catalog Admin</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white shadow-sm border rounded border-slate-200 overflow-hidden">
          <div className="overflow-x-auto border-b border-slate-200">
            <div className="flex min-w-max">
              <TabButton
                active={activeTab === 'species'}
                onClick={() => setActiveTab('species')}
                icon={<TreePine className="w-5 h-5" />}
                label="Species"
              />
              <TabButton
                active={activeTab === 'stands'}
                onClick={() => setActiveTab('stands')}
                icon={<Package className="w-5 h-5" />}
                label="Stands"
              />
              <TabButton
                active={activeTab === 'wreaths'}
                onClick={() => setActiveTab('wreaths')}
                icon={<Gift className="w-5 h-5" />}
                label="Wreaths"
              />
              <TabButton
                active={activeTab === 'delivery'}
                onClick={() => setActiveTab('delivery')}
                icon={<Truck className="w-5 h-5" />}
                label="Delivery"
              />
              <TabButton
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
                icon={<ShoppingBag className="w-5 h-5" />}
                label="Orders"
              />
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'species' && <SpeciesEditor species={species} onUpdate={loadData} />}
            {activeTab === 'stands' && <StandsEditor stands={stands} onUpdate={loadData} />}
            {activeTab === 'wreaths' && <WreathsEditor wreaths={wreaths} onUpdate={loadData} />}
            {activeTab === 'delivery' && <DeliveryEditor options={deliveryOptions} onUpdate={loadData} />}
            {activeTab === 'orders' && <OrdersViewer orders={orders} onUpdate={loadData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-white text-primary-700 border-b-2 border-primary-600'
          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SpeciesEditor({ species, onUpdate }: { species: Species[]; onUpdate: () => void }) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [variants, setVariants] = useState<FullnessVariant[]>([]);
  const [heights, setHeights] = useState<SpeciesHeight[]>([]);
  const [savedHeight, setSavedHeight] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddHeightForm, setShowAddHeightForm] = useState(false);
  const [newHeight, setNewHeight] = useState<number>(6);
  const [newHeightPrice, setNewHeightPrice] = useState<number>(0);
  const [newSpecies, setNewSpecies] = useState({ name: '', description: '', sortOrder: 0 });
  const [editedSpeciesData, setEditedSpeciesData] = useState<{ name: string; description: string } | null>(null);
  const [savedSpecies, setSavedSpecies] = useState(false);
  const [defaultImage, setDefaultImage] = useState<string>('');

  useEffect(() => {
    if (selectedSpecies) {
      loadVariants(selectedSpecies.id);
      loadHeights(selectedSpecies.id);
      setEditedSpeciesData({ name: selectedSpecies.name, description: selectedSpecies.description });
    } else {
      setEditedSpeciesData(null);
      setDefaultImage('');
    }
  }, [selectedSpecies]);

  async function loadVariants(speciesId: string) {
    const { data } = await supabase
      .from('fullness_variants')
      .select('*')
      .eq('species_id', speciesId)
      .order('fullness_type');

    if (data) {
      setVariants(data);
      const mediumVariant = data.find(v => v.fullness_type === 'medium');
      if (mediumVariant) {
        setDefaultImage(mediumVariant.image_url);
      }
    }
  }

  async function loadHeights(speciesId: string) {
    const { data } = await supabase
      .from('species_heights')
      .select('*')
      .eq('species_id', speciesId)
      .order('height_feet');

    if (data) setHeights(data);
  }

  async function updateDefaultImage(imageUrl: string) {
    if (!selectedSpecies) return;

    const mediumVariant = variants.find(v => v.fullness_type === 'medium');
    if (!mediumVariant) return;

    // @ts-ignore - RLS types are overly strict
    const { error } = await supabase.from('fullness_variants').update({ image_url: imageUrl } as any).eq('id', mediumVariant.id);

    if (error) {
      alert('Failed to save image: ' + error.message);
      return;
    }

    setDefaultImage(imageUrl);
    await loadVariants(selectedSpecies.id);
  }

  async function addSpecies() {
    if (!newSpecies.name.trim()) {
      alert('Please enter a species name');
      return;
    }

    const { data: insertedSpecies, error: speciesError } = await supabase
      .from('species')
      .insert({
        name: newSpecies.name,
        description: newSpecies.description,
        sort_order: newSpecies.sortOrder,
        visible: true,
      })
      .select()
      .single();

    if (speciesError || !insertedSpecies) {
      alert('Failed to create species: ' + speciesError?.message);
      return;
    }

    const variantsToInsert = [
      { species_id: insertedSpecies.id, fullness_type: 'thin', image_url: '', price_per_foot: 0, available: false },
      { species_id: insertedSpecies.id, fullness_type: 'medium', image_url: '', price_per_foot: 0, available: false },
      { species_id: insertedSpecies.id, fullness_type: 'full', image_url: '', price_per_foot: 0, available: false },
    ];

    const { error: variantsError } = await supabase.from('fullness_variants').insert(variantsToInsert);

    if (variantsError) {
      alert('Species created but failed to create variants: ' + variantsError.message);
    }

    const heightsToInsert = [5, 6, 7, 8, 9, 10].map(height => ({
      species_id: insertedSpecies.id,
      height_feet: height,
      available: true,
    }));

    const { error: heightsError } = await supabase.from('species_heights').insert(heightsToInsert);

    if (heightsError) {
      alert('Species created but failed to create heights: ' + heightsError.message);
    }

    setNewSpecies({ name: '', description: '', sortOrder: 0 });
    setShowAddForm(false);
    onUpdate();
  }

  async function toggleSpeciesVisibility(speciesId: string, currentVisibility: boolean) {
    await supabase.from('species').update({ visible: !currentVisibility }).eq('id', speciesId);
    onUpdate();
  }

  async function updateSpeciesInfo() {
    if (!selectedSpecies || !editedSpeciesData) return;

    const { error } = await supabase
      .from('species')
      .update({
        name: editedSpeciesData.name,
        description: editedSpeciesData.description
      })
      .eq('id', selectedSpecies.id);

    if (error) {
      alert('Failed to update species: ' + error.message);
      return;
    }

    setSavedSpecies(true);
    setTimeout(() => setSavedSpecies(false), 2000);
    onUpdate();
  }

  async function addHeight() {
    if (!selectedSpecies) return;

    const exists = heights.some(h => h.height_feet === newHeight);
    if (exists) {
      alert('This height already exists for this species');
      return;
    }

    const { error } = await supabase
      .from('species_heights')
      .insert({
        species_id: selectedSpecies.id,
        height_feet: newHeight,
        price_per_foot: newHeightPrice,
        available: true
      });

    if (error) {
      alert('Failed to add height: ' + error.message);
      return;
    }

    setShowAddHeightForm(false);
    setNewHeight(6);
    setNewHeightPrice(0);
    loadHeights(selectedSpecies.id);
  }

  async function updateHeight(heightId: string, updates: { available?: boolean; price_per_foot?: number }) {
    const { error } = await supabase
      .from('species_heights')
      .update(updates)
      .eq('id', heightId);

    if (error) {
      alert('Failed to update height: ' + error.message);
      return;
    }

    setSavedHeight(heightId);
    setTimeout(() => setSavedHeight(null), 2000);

    if (selectedSpecies) {
      loadHeights(selectedSpecies.id);
    }
  }

  async function deleteHeight(heightId: string) {
    if (!confirm('Are you sure you want to delete this height option?')) return;

    const { error } = await supabase
      .from('species_heights')
      .delete()
      .eq('id', heightId);

    if (error) {
      alert('Failed to delete height: ' + error.message);
      return;
    }

    if (selectedSpecies) {
      loadHeights(selectedSpecies.id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border rounded border-blue-200 p-4 mb-6">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Image & Pricing:</span> Each species requires a default tree image. Configure pricing per foot for each height option (e.g., 7ft trees at $20/ft, 8ft trees at $25/ft).
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Species List</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors text-sm font-medium"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? 'Cancel' : 'Add Species'}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-4 p-4 bg-slate-50  border rounded border-slate-200 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Species Name</label>
                <input
                  type="text"
                  value={newSpecies.name}
                  onChange={(e) => setNewSpecies({ ...newSpecies, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Noble Fir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newSpecies.description}
                  onChange={(e) => setNewSpecies({ ...newSpecies, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Describe the tree species..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={newSpecies.sortOrder}
                  onChange={(e) => setNewSpecies({ ...newSpecies, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                onClick={addSpecies}
                className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Species
              </button>
            </div>
          )}

          <div className="space-y-2">
            {species.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSpecies(s)}
                  className={`flex-1 text-left px-4 py-2.5 border rounded transition-colors ${
                    selectedSpecies?.id === s.id
                      ? 'bg-primary-50 border-primary-300 text-primary-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm opacity-70">Sort: {s.sort_order} • {s.visible ? 'Visible' : 'Hidden'}</div>
                </button>
                <button
                  onClick={() => toggleSpeciesVisibility(s.id, s.visible)}
                  className={`px-3 py-2 border rounded font-medium text-sm transition-colors ${
                    s.visible
                      ? 'bg-primary-50 border-primary-300 text-primary-700 hover:bg-primary-100'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.visible ? 'Hide' : 'Show'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedSpecies ? (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Species Information</h3>
                  {savedSpecies && (
                    <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                      <Check className="w-3 h-3" />
                      Saved
                    </span>
                  )}
                </div>
                {editedSpeciesData && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Species Name</label>
                      <input
                        type="text"
                        value={editedSpeciesData.name}
                        onChange={(e) => setEditedSpeciesData({ ...editedSpeciesData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={editedSpeciesData.description}
                        onChange={(e) => setEditedSpeciesData({ ...editedSpeciesData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={updateSpeciesInfo}
                      className="w-full px-4 py-2 bg-primary-700 text-white hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save Species Info
                    </button>
                  </>
                )}
              </div>

              <div className="bg-slate-50 rounded p-4 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Default Tree Image</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={defaultImage}
                      onChange={(e) => setDefaultImage(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => updateDefaultImage(defaultImage)}
                      className="px-4 py-2 bg-primary-700 text-white hover:bg-primary-800 rounded transition-colors flex items-center gap-2 font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                {defaultImage && !defaultImage.includes('placeholder') && (
                  <img src={defaultImage} alt={selectedSpecies.name} className="w-full h-48 object-contain border rounded border-slate-200" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Available Heights</h3>
                <button
                  onClick={() => setShowAddHeightForm(!showAddHeightForm)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-700 text-white hover:bg-primary-800 transition-colors text-sm font-medium rounded"
                >
                  {showAddHeightForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showAddHeightForm ? 'Cancel' : 'Add Height'}
                </button>
              </div>

              {showAddHeightForm && (
                <div className="bg-slate-50 border rounded border-slate-200 p-3 space-y-2.5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Height (feet)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      step="0.5"
                      value={newHeight}
                      onChange={(e) => setNewHeight(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 6.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price per Foot ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newHeightPrice}
                      onChange={(e) => setNewHeightPrice(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 20.00"
                    />
                  </div>
                  <button
                    onClick={addHeight}
                    className="w-full px-3 py-1.5 bg-primary-700 text-white hover:bg-primary-800 transition-colors flex items-center justify-center gap-1.5 font-medium text-sm rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Height
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {heights.map((height) => (
                  <div
                    key={height.id}
                    className={`border rounded p-3 transition-colors ${
                      height.available
                        ? 'bg-white border-slate-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${height.available ? 'text-slate-900' : 'text-slate-400'}`}>
                        {height.height_feet} ft
                      </span>
                      <div className="flex items-center gap-2">
                        {savedHeight === height.id && (
                          <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <button
                          onClick={() => deleteHeight(height.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete height"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={height.price_per_foot || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            const newHeights = heights.map(h =>
                              h.id === height.id ? { ...h, price_per_foot: value } : h
                            );
                            setHeights(newHeights);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            updateHeight(height.id, { price_per_foot: value });
                          }}
                          className="flex-1 px-2 py-1 text-sm border rounded border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Price/ft"
                        />
                        <span className="text-xs text-slate-600">/ft</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={height.available}
                          onChange={(e) => updateHeight(height.id, { available: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600">Available for customers</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Select a species to edit variants
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StandsEditor({ stands, onUpdate }: { stands: Stand[]; onUpdate: () => void }) {
  const [editedStands, setEditedStands] = useState<Stand[]>(stands);
  const [savedStand, setSavedStand] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStand, setNewStand] = useState({ name: '', price: 0, fitsUpToFeet: null as number | null, sortOrder: 0 });

  useEffect(() => {
    setEditedStands(stands);
  }, [stands]);

  async function updateStand(standId: string, updates: { title?: string; description?: string | null; price?: number; fits_up_to_feet?: number | null; visible?: boolean }) {
    // @ts-ignore - RLS types are overly strict
    const { error} = await supabase.from('stands').update(updates as any).eq('id', standId);
    if (!error) {
      setSavedStand(standId);
      setTimeout(() => setSavedStand(null), 2000);
    }
    onUpdate();
  }

  function handleStandChange(standId: string, field: keyof Stand, value: any) {
    setEditedStands(prev => prev.map(s =>
      s.id === standId ? { ...s, [field]: value } : s
    ));
  }

  async function addStand() {
    if (!newStand.name.trim()) {
      alert('Please enter a stand name');
      return;
    }

    const { error } = await supabase.from('stands').insert({
      name: newStand.name,
      title: newStand.name,
      price: newStand.price,
      fits_up_to_feet: newStand.fitsUpToFeet,
      sort_order: newStand.sortOrder,
      visible: true,
    });

    if (error) {
      alert('Failed to create stand: ' + error.message);
      return;
    }

    setNewStand({ name: '', price: 0, fitsUpToFeet: null, sortOrder: 0 });
    setShowAddForm(false);
    onUpdate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Tree Stands</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors text-sm font-medium"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Stand'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-50  border rounded border-slate-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stand Name</label>
            <input
              type="text"
              value={newStand.name}
              onChange={(e) => setNewStand({ ...newStand, name: e.target.value })}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Standard Stand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newStand.price}
                onChange={(e) => setNewStand({ ...newStand, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fits up to (feet)</label>
              <input
                type="number"
                value={newStand.fitsUpToFeet || ''}
                onChange={(e) => setNewStand({ ...newStand, fitsUpToFeet: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={newStand.sortOrder}
              onChange={(e) => setNewStand({ ...newStand, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={addStand}
            className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Stand
          </button>
        </div>
      )}

      {editedStands.map((stand) => (
        <div key={stand.id} className="bg-slate-50 rounded  p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{stand.name}</span>
              {savedStand === stand.id && (
                <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stand.visible}
                onChange={(e) => updateStand(stand.id, { visible: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">Visible</span>
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title (shown to customers)</label>
              <input
                type="text"
                value={stand.title}
                onChange={(e) => handleStandChange(stand.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Premium Tree Stand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={stand.description || ''}
                onChange={(e) => handleStandChange(stand.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={2}
                placeholder="Describe the stand features..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stand.price}
                  onChange={(e) => handleStandChange(stand.id, 'price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fits up to (feet)</label>
                <input
                  type="number"
                  value={stand.fits_up_to_feet || ''}
                  onChange={(e) => handleStandChange(stand.id, 'fits_up_to_feet', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const currentStand = editedStands.find(s => s.id === stand.id);
                if (currentStand) {
                  updateStand(stand.id, { title: currentStand.title, description: currentStand.description, price: currentStand.price, fits_up_to_feet: currentStand.fits_up_to_feet });
                }
              }}
              className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function WreathsEditor({ wreaths, onUpdate }: { wreaths: WreathType[]; onUpdate: () => void }) {
  const [editedWreaths, setEditedWreaths] = useState<WreathType[]>(wreaths);
  const [savedWreath, setSavedWreath] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWreath, setNewWreath] = useState({ size: 'small' as 'small' | 'medium' | 'large', price: 0, sortOrder: 0 });

  useEffect(() => {
    setEditedWreaths(wreaths);
  }, [wreaths]);

  async function updateWreath(wreathId: string, updates: { title?: string; description?: string | null; price?: number; visible?: boolean }) {
    // @ts-ignore - RLS types are overly strict
    const { error } = await supabase.from('wreaths').update(updates as any).eq('id', wreathId);
    if (!error) {
      setSavedWreath(wreathId);
      setTimeout(() => setSavedWreath(null), 2000);
    }
    onUpdate();
  }

  function handleWreathChange(wreathId: string, field: keyof WreathType, value: any) {
    setEditedWreaths(prev => prev.map(w =>
      w.id === wreathId ? { ...w, [field]: value } : w
    ));
  }

  async function addWreath() {
    const existingSize = wreaths.find(w => w.size === newWreath.size);
    if (existingSize) {
      alert('A wreath with this size already exists');
      return;
    }

    const titleCase = newWreath.size.charAt(0).toUpperCase() + newWreath.size.slice(1);
    const { error } = await supabase.from('wreaths').insert({
      size: newWreath.size,
      title: `${titleCase} Wreath`,
      price: newWreath.price,
      sort_order: newWreath.sortOrder,
      visible: true,
    });

    if (error) {
      alert('Failed to create wreath: ' + error.message);
      return;
    }

    setNewWreath({ size: 'small', price: 0, sortOrder: 0 });
    setShowAddForm(false);
    onUpdate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Wreaths</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors text-sm font-medium"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Wreath'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-50  border rounded border-slate-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
            <select
              value={newWreath.size}
              onChange={(e) => setNewWreath({ ...newWreath, size: e.target.value as 'small' | 'medium' | 'large' })}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={newWreath.price}
              onChange={(e) => setNewWreath({ ...newWreath, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={newWreath.sortOrder}
              onChange={(e) => setNewWreath({ ...newWreath, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={addWreath}
            className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Wreath
          </button>
        </div>
      )}

      {editedWreaths.map((wreath) => (
        <div key={wreath.id} className="bg-slate-50 rounded  p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 capitalize">{wreath.size}</span>
              {savedWreath === wreath.id && (
                <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wreath.visible}
                onChange={(e) => updateWreath(wreath.id, { visible: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">Visible</span>
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title (shown to customers)</label>
              <input
                type="text"
                value={wreath.title}
                onChange={(e) => handleWreathChange(wreath.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Premium Holiday Wreath"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={wreath.description || ''}
                onChange={(e) => handleWreathChange(wreath.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={2}
                placeholder="Describe the wreath..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={wreath.price}
                onChange={(e) => handleWreathChange(wreath.id, 'price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => {
                const currentWreath = editedWreaths.find(w => w.id === wreath.id);
                if (currentWreath) {
                  updateWreath(wreath.id, { title: currentWreath.title, description: currentWreath.description, price: currentWreath.price });
                }
              }}
              className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliveryEditor({ options, onUpdate }: { options: DeliveryOption[]; onUpdate: () => void }) {
  const [editedOptions, setEditedOptions] = useState<DeliveryOption[]>(options);
  const [savedOption, setSavedOption] = useState<string | null>(null);

  useEffect(() => {
    setEditedOptions(options);
  }, [options]);

  async function updateDelivery(optionId: string, updates: { fee?: number; description?: string | null; visible?: boolean }) {
    // @ts-ignore - RLS types are overly strict
    const { error } = await supabase.from('delivery_options').update(updates as any).eq('id', optionId);
    if (!error) {
      setSavedOption(optionId);
      setTimeout(() => setSavedOption(null), 2000);
    }
    onUpdate();
  }

  function handleOptionChange(optionId: string, field: keyof DeliveryOption, value: any) {
    setEditedOptions(prev => prev.map(o =>
      o.id === optionId ? { ...o, [field]: value } : o
    ));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Delivery Options</h3>
      {editedOptions.map((option) => (
        <div key={option.id} className="bg-slate-50 rounded  p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{option.name}</span>
              {savedOption === option.id && (
                <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={option.visible}
                onChange={(e) => updateDelivery(option.id, { visible: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">Visible</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={option.fee}
              onChange={(e) => handleOptionChange(option.id, 'fee', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={option.description || ''}
              onChange={(e) => handleOptionChange(option.id, 'description', e.target.value)}
              className="w-full px-3 py-2 border rounded border-slate-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional description"
            />
          </div>
          <button
            onClick={() => {
              const currentOption = editedOptions.find(o => o.id === option.id);
              if (currentOption) {
                updateDelivery(option.id, { fee: currentOption.fee, description: currentOption.description });
              }
            }}
            className="w-full px-4 py-2 bg-primary-700 text-white  hover:bg-primary-800 rounded transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      ))}
    </div>
  );
}

function OrdersViewer({ orders, onUpdate }: { orders: OrderWithItems[]; onUpdate: () => void }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalTrees = orders.reduce((sum, order) => {
    const treesInOrder = order.order_trees?.reduce((treeSum, tree) => treeSum + tree.quantity, 0) || 0;
    return sum + treesInOrder;
  }, 0);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
      return;
    }

    onUpdate();
  }

  async function deleteOrder(orderId: string, orderNumber: string) {
    if (!confirm(`Are you sure you want to delete order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
      return;
    }

    onUpdate();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Orders ({orders.length})</h2>
      </div>

      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">Total Revenue</div>
                <div className="text-xl sm:text-2xl font-bold text-green-900">${totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Total Trees</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-900">{totalTrees}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded border-slate-200 overflow-hidden"
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                      Order #{order.order_number}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      {new Date(order.created_at!).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-3">
                  <div>
                    <div className="text-slate-600 mb-1 text-xs sm:text-sm">Customer</div>
                    <div className="font-medium text-slate-900 text-sm">{order.customer_first_name} {order.customer_last_name}</div>
                    <div className="text-slate-600 text-xs sm:text-sm truncate">{order.customer_email}</div>
                    <div className="text-slate-600 text-xs sm:text-sm">{order.customer_phone}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1 text-xs sm:text-sm">Total</div>
                    <div className="font-semibold text-slate-900 text-base sm:text-lg">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="text-xs sm:text-sm text-primary-700 hover:text-primary-800 font-medium"
                >
                  {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                </button>

                {expandedOrder === order.id && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 space-y-3">
                    {order.order_trees && order.order_trees.length > 0 && (
                      <div>
                        <div className="font-semibold text-slate-900 mb-2 text-sm">Trees</div>
                        <div className="space-y-2">
                          {order.order_trees.map((tree, idx) => (
                            <div key={idx} className="bg-slate-50 p-2 sm:p-3 rounded">
                              <div className="text-slate-900 font-medium text-xs sm:text-sm">
                                {tree.quantity > 1 ? `${tree.quantity}x ` : ''}{tree.species?.name || 'Unknown Species'} - {tree.height_feet} ft ({tree.fullness_type})
                              </div>
                              <div className="text-slate-600 text-xs mt-1 space-y-0.5">
                                <div>Fresh Cut: {tree.fresh_cut ? 'Yes' : 'No'}</div>
                                <div>Price: ${tree.unit_price.toFixed(2)}{tree.quantity > 1 ? ` × ${tree.quantity}` : ''} = ${(tree.unit_price * tree.quantity).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.order_stands && order.order_stands.length > 0 && (
                      <div>
                        <div className="font-semibold text-slate-900 mb-2 text-sm">Stands</div>
                        <div className="space-y-2">
                          {order.order_stands.map((stand, idx) => (
                            <div key={idx} className="bg-slate-50 p-2 sm:p-3 rounded">
                              <div className="text-slate-900 font-medium text-xs sm:text-sm">
                                {stand.is_own_stand ? 'Own Stand' : (stand.stands?.name || 'Stand')}
                              </div>
                              <div className="text-slate-600 text-xs mt-1">
                                <div>Price: ${stand.unit_price.toFixed(2)} × {stand.quantity} = ${(stand.unit_price * stand.quantity).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.order_wreaths && order.order_wreaths.length > 0 && (
                      <div>
                        <div className="font-semibold text-slate-900 mb-2 text-sm">Wreaths</div>
                        <div className="space-y-2">
                          {order.order_wreaths.map((wreath, idx) => (
                            <div key={idx} className="bg-slate-50 p-2 sm:p-3 rounded">
                              <div className="text-slate-900 font-medium text-xs sm:text-sm">
                                {wreath.wreaths?.size || 'Wreath'}
                              </div>
                              <div className="text-slate-600 text-xs mt-1">
                                <div>Price: ${wreath.unit_price.toFixed(2)} × {wreath.quantity} = ${(wreath.unit_price * wreath.quantity).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 p-2 sm:p-3 rounded">
                      <div className="font-semibold text-slate-900 mb-1 text-sm">Delivery</div>
                      <div className="text-slate-600 text-xs">
                        <div>Fee: ${order.delivery_fee.toFixed(2)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900 mb-2 text-sm">Delivery Address</div>
                      <div className="text-xs sm:text-sm text-slate-600 space-y-0.5">
                        <div className="font-medium text-slate-900">{order.customer_first_name} {order.customer_last_name}</div>
                        <div>{order.delivery_street}</div>
                        {order.delivery_unit && <div>{order.delivery_unit}</div>}
                        <div>{order.delivery_city}, {order.delivery_state} {order.delivery_zip}</div>
                      </div>
                    </div>

                    {(order.preferred_delivery_date || order.preferred_delivery_time) && (
                      <div>
                        <div className="font-semibold text-slate-900 mb-2 text-sm">Preferred Delivery</div>
                        <div className="text-xs sm:text-sm text-slate-600 space-y-0.5">
                          {order.preferred_delivery_date && (
                            <div>{new Date(order.preferred_delivery_date).toLocaleDateString()}</div>
                          )}
                          {order.preferred_delivery_time && <div>{order.preferred_delivery_time}</div>}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div>
                        <div className="font-semibold text-slate-900 mb-2 text-sm">Special Instructions</div>
                        <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-2 sm:p-3 rounded border border-slate-200">
                          {order.notes}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2 sm:justify-between">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                              className="px-3 sm:px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Mark as </span>Fulfilled
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'canceled')}
                              className="px-3 sm:px-4 py-2 bg-slate-600 text-white font-medium rounded hover:bg-slate-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                            >
                              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Mark as </span>Canceled
                            </button>
                          </>
                        )}
                        {order.status === 'fulfilled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            className="px-3 sm:px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition-colors text-xs sm:text-sm"
                          >
                            Mark as Pending
                          </button>
                        )}
                        {order.status === 'canceled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            className="px-3 sm:px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition-colors text-xs sm:text-sm"
                          >
                            Mark as Pending
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteOrder(order.id, order.order_number)}
                        className="px-3 sm:px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
