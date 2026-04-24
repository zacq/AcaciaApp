import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Search, X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../supabase';

type SpeciesTab = 'sheep' | 'beef' | 'goat';

type Breed = {
  id: string;
  name: string;
  species: string;
  notes?: string;
  created_at: string;
};

type BreedForm = { name: string; species: string; notes: string };

const SPECIES_TABS: { tab: SpeciesTab; label: string; species: string; emoji: string }[] = [
  { tab: 'sheep', label: 'Sheep',  species: 'sheep',  emoji: '🐑' },
  { tab: 'beef',  label: 'Beef',   species: 'cattle', emoji: '🐄' },
  { tab: 'goat',  label: 'Goat',   species: 'goat',   emoji: '🐐' },
];

const emptyForm = (species: string): BreedForm => ({ name: '', species, notes: '' });

export default function AnimalBreeds() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesTab, setSpeciesTab] = useState<SpeciesTab>('sheep');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Breed | null>(null);
  const [form, setForm] = useState<BreedForm>(emptyForm('sheep'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('breeds')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        setBreeds((data as Breed[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSearch('');
    setShowSearch(false);
  }, [speciesTab]);

  const activeSpecies = SPECIES_TABS.find(t => t.tab === speciesTab)!.species;

  const speciesBreeds = breeds.filter(b => b.species === activeSpecies);

  const filtered = search
    ? speciesBreeds.filter(
        b =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.notes?.toLowerCase().includes(search.toLowerCase())
      )
    : speciesBreeds;

  const speciesCount = (sp: string) => breeds.filter(b => b.species === sp).length;

  const openAdd = () => {
    setForm(emptyForm(activeSpecies));
    setEditTarget(null);
    setSheetMode('add');
    setError('');
  };

  const openEdit = (breed: Breed) => {
    setForm({ name: breed.name, species: breed.species, notes: breed.notes ?? '' });
    setEditTarget(breed);
    setSheetMode('edit');
    setError('');
  };

  const closeSheet = () => {
    setSheetMode(null);
    setEditTarget(null);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Breed name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (sheetMode === 'add') {
        const { data, error: err } = await supabase
          .from('breeds')
          .insert({ name: form.name.trim(), species: form.species, notes: form.notes || null })
          .select()
          .single();
        if (err) { setError(err.message); return; }
        setBreeds(prev => [...prev, data as Breed].sort((a, b) => a.name.localeCompare(b.name)));
      } else if (sheetMode === 'edit' && editTarget) {
        const { data, error: err } = await supabase
          .from('breeds')
          .update({ name: form.name.trim(), notes: form.notes || null })
          .eq('id', editTarget.id)
          .select()
          .single();
        if (err) { setError(err.message); return; }
        setBreeds(prev =>
          prev.map(b => b.id === editTarget.id ? data as Breed : b)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      closeSheet();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('breeds').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setBreeds(prev => prev.filter(b => b.id !== id));
  };

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-[49px] z-20 bg-background border-b border-accent/50">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <PageHeader
            title="Animal Breeds"
            action={
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
              >
                <Plus size={18} />
                Add Breed
              </button>
            }
          />

          {/* Species tabs + search toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-accent/30 p-1 rounded-2xl flex-1 gap-0.5">
              {SPECIES_TABS.map(({ tab, label, species, emoji }) => (
                <button
                  key={tab}
                  onClick={() => setSpeciesTab(tab)}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${speciesTab === tab ? 'bg-surface shadow-sm text-primary' : 'text-primary-light'}`}
                >
                  <span>{emoji}</span>
                  <span className="hidden sm:inline text-xs">{label}</span>
                  <span className="text-[10px] opacity-60">({speciesCount(species)})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(s => !s)}
              className={`p-2 rounded-xl transition-colors shrink-0 ${showSearch ? 'bg-primary text-white' : 'hover:bg-accent text-primary-light'}`}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Collapsible search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="relative pb-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light/40" size={16} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search breeds…"
                    className="input-field pl-9 pr-9 py-2 text-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light/40 hover:text-primary-light"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-28">
        {loading ? (
          <table className="w-full text-sm mt-2">
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-accent/30">
                  <td className="py-3 w-8"><div className="h-4 w-5 bg-accent/30 rounded animate-pulse" /></td>
                  <td className="py-3 pr-3"><div className="h-4 w-28 bg-accent/40 rounded animate-pulse" /></td>
                  <td className="py-3 pr-3 hidden sm:table-cell"><div className="h-4 w-40 bg-accent/30 rounded animate-pulse" /></td>
                  <td className="py-3 w-16"><div className="flex gap-2 justify-end"><div className="w-6 h-6 bg-accent/30 rounded animate-pulse" /><div className="w-6 h-6 bg-accent/30 rounded animate-pulse" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-accent rounded-[2rem] mt-4">
            <BookOpen size={40} className="mx-auto text-accent mb-3" />
            <p className="text-primary-light font-medium text-sm">
              {search ? 'No breeds match your search' : `No ${activeSpecies} breeds recorded yet`}
            </p>
            {!search && (
              <button onClick={openAdd} className="mt-3 text-primary font-bold flex items-center gap-2 mx-auto text-sm">
                <Plus size={18} /> Add first {activeSpecies} breed
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="border-b-2 border-accent text-[10px] uppercase tracking-wider text-primary-light/50 font-bold">
                <th className="py-2 text-left w-8">#</th>
                <th className="py-2 text-left pr-3">Breed</th>
                <th className="py-2 text-left pr-3 hidden sm:table-cell">Notes</th>
                <th className="py-2 text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/30">
              {filtered.map((breed, idx) => (
                <tr key={breed.id} className="hover:bg-accent/20 transition-colors">
                  <td className="py-2.5 pr-3 text-[11px] text-primary-light/40 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold text-primary-dark text-[13px]">{breed.name}</span>
                    {breed.notes && (
                      <span className="sm:hidden block text-[10px] text-primary-light/60 leading-tight mt-0.5 truncate max-w-[160px]">
                        {breed.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-primary-light hidden sm:table-cell max-w-[200px]">
                    <span className="truncate block">{breed.notes || '—'}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(breed)}
                        className="p-1.5 text-primary-light hover:text-primary hover:bg-accent rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(breed.id)}
                        className="p-1.5 text-primary-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit bottom sheet ────────────────────────────────── */}
      <AnimatePresence>
        {sheetMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[2rem] z-50"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-primary">
                    {sheetMode === 'add' ? 'Add Breed' : 'Edit Breed'}
                  </h3>
                  <button onClick={closeSheet} className="p-2 hover:bg-accent rounded-xl">
                    <X size={22} className="text-primary-light" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 pb-6">
                  <div>
                    <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">
                      Breed Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="e.g. Merino"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">
                      Species
                    </label>
                    <select
                      className="input-field"
                      value={form.species}
                      onChange={e => setForm({ ...form, species: e.target.value })}
                      disabled={sheetMode === 'edit'}
                    >
                      <option value="sheep">Sheep</option>
                      <option value="cattle">Beef Cattle</option>
                      <option value="goat">Goat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <input
                      className="input-field"
                      placeholder="Brief description…"
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : null}
                    {saving ? 'Saving…' : sheetMode === 'add' ? 'Save Breed' : 'Update Breed'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
