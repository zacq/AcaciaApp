import React, { useEffect, useState } from 'react';
import { Plus, Search, X, ChevronRight, Stethoscope, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../supabase';
import { Animal } from '../types';

type SpeciesTab = 'sheep' | 'beef' | 'goat';

const SPECIES_TABS: { tab: SpeciesTab; label: string; species: string; emoji: string }[] = [
  { tab: 'sheep', label: 'Sheep', species: 'Sheep',  emoji: '🐑' },
  { tab: 'beef',  label: 'Beef',  species: 'Cattle', emoji: '🐄' },
  { tab: 'goat',  label: 'Goat',  species: 'Goat',   emoji: '🐐' },
];

type TreatmentRecord = {
  id: string;
  animal_id: string;
  medicine_name?: string;
  dosage?: string;
  treatment_date: string;
  withdrawal_days?: number;
  notes?: string;
  created_at: string;
  animal?: { id: string; tag_number: string; name?: string; species: string; breed: string };
};

type FormState = {
  animal_id: string;
  treatment_date: string;
  medicine_name: string;
  dosage: string;
  withdrawal_days: string;
  notes: string;
};

const emptyForm = (date: string): FormState => ({
  animal_id: '', treatment_date: date, medicine_name: '',
  dosage: '', withdrawal_days: '', notes: '',
});

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: '2-digit' });

export default function Treatments() {
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesTab, setSpeciesTab] = useState<SpeciesTab>('sheep');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(format(new Date(), 'yyyy-MM-dd')));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase
        .from('treatments')
        .select('*, animal:animals(id, tag_number, name, species, breed)')
        .order('treatment_date', { ascending: false }),
      supabase
        .from('animals')
        .select('id, tag_number, name, species, breed, sex')
        .eq('status', 'active')
        .order('tag_number'),
    ]).then(([recRes, anRes]) => {
      setRecords((recRes.data as TreatmentRecord[]) ?? []);
      setAnimals((anRes.data as Animal[]) ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { setSearch(''); setShowSearch(false); }, [speciesTab]);

  const activeSpecies = SPECIES_TABS.find(t => t.tab === speciesTab)!.species;

  const speciesRecords = records.filter(
    r => r.animal?.species?.toLowerCase() === activeSpecies.toLowerCase()
  );

  const filtered = search
    ? speciesRecords.filter(r =>
        r.animal?.tag_number.toLowerCase().includes(search.toLowerCase()) ||
        r.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.animal?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : speciesRecords;

  const speciesAnimals = animals.filter(
    a => a.species?.toLowerCase() === activeSpecies.toLowerCase()
  );

  const speciesCount = (sp: string) =>
    records.filter(r => r.animal?.species?.toLowerCase() === sp.toLowerCase()).length;

  const openSheet = () => {
    setForm(emptyForm(format(new Date(), 'yyyy-MM-dd')));
    setError('');
    setShowSheet(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animal_id) { setError('Please select an animal'); return; }
    if (!form.medicine_name.trim()) { setError('Medicine name is required'); return; }
    setSaving(true); setError('');
    const payload = {
      animal_id: form.animal_id,
      treatment_date: form.treatment_date,
      medicine_name: form.medicine_name.trim(),
      dosage: form.dosage || null,
      withdrawal_days: form.withdrawal_days ? Number(form.withdrawal_days) : null,
      notes: form.notes || null,
    };
    const { data, error: err } = await supabase
      .from('treatments').insert(payload)
      .select('*, animal:animals(id, tag_number, name, species, breed)')
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    setRecords(prev => [data as TreatmentRecord, ...prev]);
    setShowSheet(false);
  };

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-[49px] z-20 bg-background border-b border-accent/50">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
          <PageHeader
            title="Treatments"
            action={
              <button onClick={openSheet}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
                <Plus size={18} /> Add Treatment
              </button>
            }
          />
          <div className="flex items-center gap-2">
            <div className="flex bg-accent/30 p-1 rounded-2xl flex-1 gap-0.5">
              {SPECIES_TABS.map(({ tab, label, species, emoji }) => (
                <button key={tab} onClick={() => setSpeciesTab(tab)}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${speciesTab === tab ? 'bg-surface shadow-sm text-primary' : 'text-primary-light'}`}>
                  <span>{emoji}</span>
                  <span className="hidden sm:inline text-xs">{label}</span>
                  <span className="text-[10px] opacity-60">({speciesCount(species)})</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSearch(s => !s)}
              className={`p-2 rounded-xl transition-colors shrink-0 ${showSearch ? 'bg-primary text-white' : 'hover:bg-accent text-primary-light'}`}>
              <Search size={18} />
            </button>
          </div>
          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="relative pb-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light/40" size={16} />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by tag or medicine…" className="input-field pl-9 pr-9 py-2 text-sm" />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light/40 hover:text-primary-light">
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
          <table className="w-full text-sm mt-2"><tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-accent/30">
                <td className="py-3 w-20"><div className="h-4 w-14 bg-accent/40 rounded animate-pulse" /></td>
                <td className="py-3 pr-3"><div className="h-4 w-24 bg-accent/40 rounded animate-pulse" /></td>
                <td className="py-3 pr-3"><div className="h-4 w-28 bg-accent/30 rounded animate-pulse" /></td>
                <td className="py-3 hidden sm:table-cell"><div className="h-4 w-16 bg-accent/30 rounded animate-pulse" /></td>
                <td className="py-3 w-12"><div className="h-5 w-10 bg-accent/30 rounded-full animate-pulse" /></td>
                <td className="py-3 w-5" />
              </tr>
            ))}
          </tbody></table>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-accent rounded-[2rem] mt-4">
            <Stethoscope size={40} className="mx-auto text-accent mb-3" />
            <p className="text-primary-light font-medium text-sm">
              {search ? 'No treatments match your search' : `No treatment records for ${activeSpecies.toLowerCase()}`}
            </p>
            {!search && (
              <button onClick={openSheet} className="mt-3 text-primary font-bold flex items-center gap-2 mx-auto text-sm">
                <Plus size={18} /> Record first treatment
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead className="sticky top-[160px] z-10 bg-background">
              <tr className="border-b-2 border-accent text-[10px] uppercase tracking-wider text-primary-light/50 font-bold">
                <th className="py-2 text-left pr-3 w-20">Date</th>
                <th className="py-2 text-left pr-3">Animal</th>
                <th className="py-2 text-left pr-3">Medicine</th>
                <th className="py-2 text-left pr-3 hidden sm:table-cell">Dosage</th>
                <th className="py-2 text-center w-14">W/draw</th>
                <th className="w-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/30">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-accent/20 transition-colors">
                  <td className="py-2.5 pr-3 text-[11px] text-primary-light whitespace-nowrap">
                    {fmtDate(r.treatment_date)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-mono text-[11px] font-bold text-primary bg-accent/50 px-1.5 py-0.5 rounded">
                      {r.animal?.tag_number ?? '—'}
                    </span>
                    {r.animal?.name && (
                      <span className="block text-[10px] text-primary-light/60 mt-0.5">{r.animal.name}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-primary-dark text-[13px]">
                    {r.medicine_name || '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-primary-light hidden sm:table-cell">
                    {r.dosage || '—'}
                  </td>
                  <td className="py-2.5 text-center">
                    {(r.withdrawal_days ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle size={10} />{r.withdrawal_days}d
                      </span>
                    ) : <span className="text-primary-light/30 text-[10px]">—</span>}
                  </td>
                  <td className="py-2.5 pl-1"><ChevronRight size={15} className="text-accent" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add bottom sheet ──────────────────────────────────────── */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
              className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[2rem] z-50 max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-primary">New Treatment</h3>
                  <button onClick={() => setShowSheet(false)} className="p-2 hover:bg-accent rounded-xl">
                    <X size={22} className="text-primary-light" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4 pb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">
                        Animal <span className="text-red-500">*</span>
                      </label>
                      <select className="input-field" value={form.animal_id}
                        onChange={e => setForm({ ...form, animal_id: e.target.value })}>
                        <option value="">Select {activeSpecies.toLowerCase()}…</option>
                        {speciesAnimals.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.tag_number}{a.name ? ` — ${a.name}` : ''} ({a.breed})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Date *</label>
                      <input type="date" required className="input-field" value={form.treatment_date}
                        onChange={e => setForm({ ...form, treatment_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Withdrawal Days</label>
                      <input type="number" min="0" className="input-field" placeholder="e.g. 21" value={form.withdrawal_days}
                        onChange={e => setForm({ ...form, withdrawal_days: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Medicine / Drug *</label>
                      <input required className="input-field" placeholder="e.g. Oxytetracycline" value={form.medicine_name}
                        onChange={e => setForm({ ...form, medicine_name: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Dosage</label>
                      <input className="input-field" placeholder="e.g. 5 ml/kg — Injection IM" value={form.dosage}
                        onChange={e => setForm({ ...form, dosage: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
                      <textarea rows={2} className="input-field resize-none" placeholder="Reason, administered by, observations…"
                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                  <button type="submit" disabled={saving}
                    className="btn-primary w-full py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {saving ? 'Saving…' : 'Save Treatment'}
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
