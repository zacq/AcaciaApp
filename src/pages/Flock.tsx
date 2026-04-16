import React, { useEffect, useState, useRef } from 'react';
import { Animal, AnimalGroup, BornAs, BreedingClass, ImageSlot } from '../types';
import {
  Plus, Search, ChevronRight, Users, X, Layers, Camera,
  ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../supabase';

type Tab = 'animals' | 'groups';

const speciesList = ['Sheep', 'Goat', 'Cattle', 'Pig', 'Other'];
const statusOptions = ['active', 'sold', 'dead', 'culled', 'archived'];
const breedingClassOptions: BreedingClass[] = ['Fullblood', 'Purebred', 'Commercial'];
const bornAsOptions: BornAs[] = ['single', 'twin', 'triplet', 'quad'];

const IMAGE_SLOTS: { slot: ImageSlot; label: string }[] = [
  { slot: 'front', label: 'Front View' },
  { slot: 'side', label: 'Side View' },
  { slot: 'rear', label: 'Rear View' },
];

type AnimalFormState = {
  // Identification
  tag_number: string;
  visual_id: string;
  eid: string;
  name: string;
  pedigree_id: string;
  registration_number: string;
  // Classification
  species: string;
  breed: string;
  sex: 'male' | 'female';
  breeding_class: BreedingClass | '';
  born_as: BornAs | '';
  color_markings: string;
  // Dates
  birth_date: string;
  acquisition_date: string;
  // Parentage
  sire_id: string;
  dam_id: string;
  dam_sire: string;
  sire_sire: string;
  adopted_dam: string;
  breeder_name: string;
  source_country: string;
  // Physical
  weight_kg: string;
  body_condition_score: string;
  cull: boolean;
  scrapie_tag: string;
  // Notes
  notes: string;
  status: Animal['status'];
};

const emptyForm: AnimalFormState = {
  tag_number: '', visual_id: '', eid: '', name: '', pedigree_id: '', registration_number: '',
  species: 'Sheep', breed: '', sex: 'female', breeding_class: '', born_as: '', color_markings: '',
  birth_date: new Date().toISOString().slice(0, 10), acquisition_date: '',
  sire_id: '', dam_id: '', dam_sire: '', sire_sire: '', adopted_dam: '', breeder_name: '', source_country: '',
  weight_kg: '', body_condition_score: '', cull: false, scrapie_tag: '',
  notes: '', status: 'active',
};

const healthColors: Record<string, string> = {
  healthy: 'bg-green-50 text-green-700',
  under_treatment: 'bg-amber-50 text-amber-700',
  monitor: 'bg-blue-50 text-blue-700',
  critical: 'bg-red-50 text-red-700',
};

// ─── Image slot state ────────────────────────────────────────────────────────
type SlotPreview = { file: File; preview: string } | null;

type ImageSlotCardProps = {
  slot: ImageSlot;
  label: string;
  value: SlotPreview;
  onChange: (file: File) => void;
  onRemove: () => void;
};

const ImageSlotCard: React.FC<ImageSlotCardProps> = ({ slot, label, value, onChange, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1 min-w-[90px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-1 text-center">{label}</p>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary aspect-square">
          <img src={value.preview} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 shadow"
          >
            <X size={14} className="text-red-500" />
          </button>
          <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            {slot}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-2xl border-2 border-dashed border-accent bg-accent/20 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary transition-all"
        >
          <Camera size={22} className="text-primary-light" />
          <span className="text-[9px] font-bold text-primary-light uppercase tracking-wider">Add</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = '';
        }}
      />
    </div>
  );
};

// ─── Add Animal Full-Page Form ───────────────────────────────────────────────
function AddAnimalPage({
  animals,
  onSave,
  onCancel,
}: {
  animals: Animal[];
  onSave: (form: AnimalFormState, images: Record<ImageSlot, SlotPreview>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AnimalFormState>(emptyForm);
  const [images, setImages] = useState<Record<ImageSlot, SlotPreview>>({ front: null, side: null, rear: null });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof AnimalFormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const sires = animals.filter(a => a.sex === 'male' && a.status === 'active');
  const dams = animals.filter(a => a.sex === 'female' && a.status === 'active');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tag_number.trim()) e.tag_number = 'Tag number is required';
    if (!form.breed.trim()) e.breed = 'Breed is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form, images);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, required, error, children,
  }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );

  const inp = "input-field";

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-accent z-10 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-accent rounded-xl">
          <ArrowLeft size={22} className="text-primary" />
        </button>
        <h2 className="text-lg font-serif font-bold text-primary flex-1">Add Animal</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-32 max-w-2xl mx-auto">

        {/* Section 1 — Identification */}
        <SectionTitle title="Identification" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Tag Number" required error={errors.tag_number}>
              <input className={inp} placeholder="e.g. A-0042" value={form.tag_number}
                onChange={e => set('tag_number', e.target.value)} />
            </Field>
          </div>
          <Field label="Visual ID">
            <input className={inp} placeholder="Visual tag" value={form.visual_id}
              onChange={e => set('visual_id', e.target.value)} />
          </Field>
          <Field label="EID">
            <input className={inp} placeholder="RFID / EID" value={form.eid}
              onChange={e => set('eid', e.target.value)} />
          </Field>
          <Field label="Animal Name">
            <input className={inp} placeholder="Name (optional)" value={form.name}
              onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Pedigree ID">
            <input className={inp} placeholder="e.g. EF106847" value={form.pedigree_id}
              onChange={e => set('pedigree_id', e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Registration Number">
              <input className={inp} placeholder="e.g. RF125479" value={form.registration_number}
                onChange={e => set('registration_number', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Section 2 — Classification */}
        <SectionTitle title="Classification" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sex" required>
            <select className={inp} value={form.sex}
              onChange={e => set('sex', e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Species" required>
            <select className={inp} value={form.species}
              onChange={e => set('species', e.target.value)}>
              {speciesList.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Breed" required error={errors.breed}>
              <input className={inp} placeholder="e.g. Dorper" value={form.breed}
                onChange={e => set('breed', e.target.value)} />
            </Field>
          </div>
          <Field label="Breeding Class">
            <select className={inp} value={form.breeding_class}
              onChange={e => set('breeding_class', e.target.value)}>
              <option value="">Select class</option>
              {breedingClassOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Born As">
            <select className={inp} value={form.born_as}
              onChange={e => set('born_as', e.target.value)}>
              <option value="">Select</option>
              {bornAsOptions.map(b => <option key={b} className="capitalize">{b}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Color / Markings">
              <input className={inp} placeholder="e.g. White with black head" value={form.color_markings}
                onChange={e => set('color_markings', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Section 3 — Dates */}
        <SectionTitle title="Dates" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of Birth">
            <input type="date" className={inp} value={form.birth_date}
              onChange={e => set('birth_date', e.target.value)} />
          </Field>
          <Field label="Acquisition Date">
            <input type="date" className={inp} value={form.acquisition_date}
              onChange={e => set('acquisition_date', e.target.value)} />
          </Field>
        </div>

        {/* Section 4 — Photos */}
        <SectionTitle title="Photos (Max 3)" badge="Stored in Supabase" />
        <div className="flex gap-3">
          {IMAGE_SLOTS.map(({ slot, label }) => (
            <ImageSlotCard
              key={slot}
              slot={slot}
              label={label}
              value={images[slot]}
              onChange={file => {
                const preview = URL.createObjectURL(file);
                setImages(prev => ({ ...prev, [slot]: { file, preview } }));
              }}
              onRemove={() => {
                if (images[slot]?.preview) URL.revokeObjectURL(images[slot]!.preview);
                setImages(prev => ({ ...prev, [slot]: null }));
              }}
            />
          ))}
        </div>

        {/* Section 5 — Parentage */}
        <SectionTitle title="Parentage" />
        <div className="grid grid-cols-1 gap-4">
          <Field label="Sire">
            <select className={inp} value={form.sire_id}
              onChange={e => set('sire_id', e.target.value)}>
              <option value="">Select sire (male)</option>
              {sires.map(a => (
                <option key={a.id} value={a.id}>
                  {a.tag_number}{a.name ? ` — ${a.name}` : ''}{a.pedigree_id ? ` (${a.pedigree_id})` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dam">
            <select className={inp} value={form.dam_id}
              onChange={e => set('dam_id', e.target.value)}>
              <option value="">Select dam (female)</option>
              {dams.map(a => (
                <option key={a.id} value={a.id}>
                  {a.tag_number}{a.name ? ` — ${a.name}` : ''}{a.pedigree_id ? ` (${a.pedigree_id})` : ''}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dam-Sire">
              <input className={inp} placeholder="Text fallback" value={form.dam_sire}
                onChange={e => set('dam_sire', e.target.value)} />
            </Field>
            <Field label="Sire-Sire">
              <input className={inp} placeholder="Text fallback" value={form.sire_sire}
                onChange={e => set('sire_sire', e.target.value)} />
            </Field>
            <Field label="Adopted Dam">
              <input className={inp} placeholder="Tag or name" value={form.adopted_dam}
                onChange={e => set('adopted_dam', e.target.value)} />
            </Field>
            <Field label="Source Country">
              <input className={inp} placeholder="e.g. South Africa" value={form.source_country}
                onChange={e => set('source_country', e.target.value)} />
            </Field>
          </div>
          <Field label="Breeder">
            <input className={inp} placeholder="Breeder name" value={form.breeder_name}
              onChange={e => set('breeder_name', e.target.value)} />
          </Field>
        </div>

        {/* Section 6 — Physical */}
        <SectionTitle title="Physical" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight (kg)">
            <input type="number" min="0" step="0.1" className={inp} placeholder="0.0" value={form.weight_kg}
              onChange={e => set('weight_kg', e.target.value)} />
          </Field>
          <Field label="Body Condition Score">
            <select className={inp} value={form.body_condition_score}
              onChange={e => set('body_condition_score', e.target.value)}>
              <option value="">Select</option>
              {['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Scrapie Tag">
            <input className={inp} placeholder="Scrapie tag no." value={form.scrapie_tag}
              onChange={e => set('scrapie_tag', e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inp} value={form.status}
              onChange={e => set('status', e.target.value as Animal['status'])}>
              {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
        </div>

        {/* Cull toggle */}
        <div className="flex items-center justify-between bg-surface border border-accent rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-orange-500" />
            <span className="font-bold text-primary-dark">Flag for Cull</span>
          </div>
          <button
            type="button"
            onClick={() => set('cull', !form.cull)}
            className={`w-12 h-6 rounded-full transition-all relative ${form.cull ? 'bg-orange-500' : 'bg-accent'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.cull ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Section 7 — Notes */}
        <SectionTitle title="Notes" />
        <textarea rows={3} className="input-field resize-none" placeholder="Any additional notes..."
          value={form.notes} onChange={e => set('notes', e.target.value)} />

      </form>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-accent px-4 py-4 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={saving}
          className="btn-primary w-full py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {saving ? 'Saving...' : 'Save Animal'}
        </button>
      </div>
    </motion.div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3">
      <h4 className="text-xs font-bold text-primary uppercase tracking-widest">{title}</h4>
      {badge && (
        <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="flex-1 h-px bg-accent" />
    </div>
  );
}

// ─── Main Flock Page ─────────────────────────────────────────────────────────
export default function Flock() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('animals');
  const [search, setSearch] = useState('');
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', purpose: '', location: '' });
  const [error, setError] = useState('');

  // Load animals + groups from Supabase
  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('animals').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('animal_groups').select('*').order('created_at', { ascending: false }),
    ]).then(([animalsRes, groupsRes]) => {
      if (animalsRes.data) setAnimals(animalsRes.data as Animal[]);
      if (groupsRes.data) setGroups(groupsRes.data as AnimalGroup[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredAnimals = animals.filter(a =>
    a.tag_number.toLowerCase().includes(search.toLowerCase()) ||
    a.breed?.toLowerCase().includes(search.toLowerCase()) ||
    a.species?.toLowerCase().includes(search.toLowerCase()) ||
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAnimal = async (
    form: AnimalFormState,
    images: Record<ImageSlot, SlotPreview>
  ) => {
    setError('');
    const payload = {
      tag_number:          form.tag_number,
      visual_id:           form.visual_id   || null,
      eid:                 form.eid         || null,
      name:                form.name        || null,
      pedigree_id:         form.pedigree_id || null,
      registration_number: form.registration_number || null,
      species:             form.species,
      breed:               form.breed,
      sex:                 form.sex,
      breeding_class:      form.breeding_class  || null,
      born_as:             form.born_as         || null,
      color_markings:      form.color_markings  || null,
      birth_date:          form.birth_date      || null,
      acquisition_date:    form.acquisition_date || null,
      sire_id:             form.sire_id         || null,
      dam_id:              form.dam_id          || null,
      dam_sire:            form.dam_sire        || null,
      sire_sire:           form.sire_sire       || null,
      adopted_dam:         form.adopted_dam     || null,
      breeder_name:        form.breeder_name    || null,
      source_country:      form.source_country  || null,
      weight_kg:           form.weight_kg ? Number(form.weight_kg) : null,
      body_condition_score: form.body_condition_score ? Number(form.body_condition_score) : null,
      cull:                form.cull,
      scrapie_tag:         form.scrapie_tag || null,
      status:              form.status,
      health_status:       'healthy',
      notes:               form.notes || null,
    };

    const { data, error: insertError } = await supabase
      .from('animals')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      throw insertError;
    }

    const newAnimal = data as Animal;

    // Upload images to Supabase Storage
    const slots = (['front', 'side', 'rear'] as ImageSlot[]);
    for (const slot of slots) {
      const slotData = images[slot];
      if (!slotData) continue;
      const ext  = slotData.file.name.split('.').pop() ?? 'jpg';
      const path = `${newAnimal.id}/${slot}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(path, slotData.file, { upsert: true });
      if (uploadError) {
        console.warn('Image upload failed:', uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from('animal-images').getPublicUrl(path);
      await supabase.from('animal_images').insert({
        animal_id:   newAnimal.id,
        file_url:    urlData.publicUrl,
        file_path:   path,
        slot,
        is_primary:  slot === 'front',
        caption:     slot,
      });
    }

    setAnimals(prev => [newAnimal, ...prev]);
    setShowAddAnimal(false);
    navigate(`/app/flock/animals/${newAnimal.id}`, { state: { animal: newAnimal } });
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error: insertError } = await supabase
      .from('animal_groups')
      .insert({ ...groupForm })
      .select()
      .single();
    if (insertError) { setError(insertError.message); return; }
    setGroups(prev => [data as AnimalGroup, ...prev]);
    setGroupForm({ name: '', purpose: '', location: '' });
    setShowAddGroup(false);
  };

  return (
    <>
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}
        <PageHeader
          title="My Flock"
          backTo="/app/home"
          action={
            <button
              onClick={() => tab === 'animals' ? setShowAddAnimal(true) : setShowAddGroup(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              {tab === 'animals' ? 'Add Animal' : 'Add Group'}
            </button>
          }
        />

        {/* Tab switcher */}
        <div className="flex bg-accent/30 p-1 rounded-2xl">
          <button
            onClick={() => setTab('animals')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'animals' ? 'bg-surface shadow-sm text-primary' : 'text-primary-light'}`}
          >
            All Animals ({animals.length})
          </button>
          <button
            onClick={() => setTab('groups')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'groups' ? 'bg-surface shadow-sm text-primary' : 'text-primary-light'}`}
          >
            Groups ({groups.length})
          </button>
        </div>

        {tab === 'animals' && (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                type="text" placeholder="Search by tag, breed, name..." className="input-field pl-12" />
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-20 bg-accent/20 rounded-3xl animate-pulse" />)
              ) : filteredAnimals.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
                  <Users size={48} className="mx-auto text-accent mb-4" />
                  <p className="text-primary-light font-medium">
                    {search ? 'No animals match your search' : 'No animals yet'}
                  </p>
                  {!search && (
                    <button onClick={() => setShowAddAnimal(true)}
                      className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
                      <Plus size={20} /> Add your first animal
                    </button>
                  )}
                </div>
              ) : (
                filteredAnimals.map(animal => (
                  <Link key={animal.id} to={`/app/flock/animals/${animal.id}`} state={{ animal }}
                    className="card flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-sm">
                        {animal.tag_number.slice(-3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary-dark">
                          {animal.name || `Tag: ${animal.tag_number}`}
                        </h4>
                        <p className="text-xs text-primary-light font-medium uppercase tracking-wider">
                          {animal.tag_number} · {animal.breed} · {animal.sex}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {animal.health_status && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize hidden sm:block ${healthColors[animal.health_status] || 'bg-accent text-primary-light'}`}>
                          {animal.health_status.replace('_', ' ')}
                        </span>
                      )}
                      {animal.cull && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 hidden sm:block">
                          Cull
                        </span>
                      )}
                      <ChevronRight size={20} className="text-accent group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'groups' && (
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
                <Layers size={48} className="mx-auto text-accent mb-4" />
                <p className="text-primary-light font-medium">No groups created yet</p>
                <button onClick={() => setShowAddGroup(true)}
                  className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
                  <Plus size={20} /> Create first group
                </button>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Layers size={22} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-dark">{group.name}</h4>
                      <p className="text-xs text-primary-light">
                        {group.location && `${group.location} · `}{group.purpose || 'No purpose set'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-accent" />
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Group Modal */}
        <AnimatePresence>
          {showAddGroup && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddGroup(false)}
                className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-40" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[2rem] z-50"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-primary">Create Group</h3>
                    <button onClick={() => setShowAddGroup(false)} className="p-2 hover:bg-accent rounded-xl">
                      <X size={22} className="text-primary-light" />
                    </button>
                  </div>
                  <form onSubmit={handleAddGroup} className="space-y-4 pb-6">
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Group Name *</label>
                      <input required className="input-field" placeholder="e.g. Ewes Group A" value={groupForm.name}
                        onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Purpose</label>
                      <input className="input-field" placeholder="e.g. Breeding, Grazing" value={groupForm.purpose}
                        onChange={e => setGroupForm({ ...groupForm, purpose: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Location / Paddock</label>
                      <input className="input-field" placeholder="e.g. Paddock 3" value={groupForm.location}
                        onChange={e => setGroupForm({ ...groupForm, location: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Create Group</button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Full-page Add Animal form */}
      <AnimatePresence>
        {showAddAnimal && (
          <AddAnimalPage
            animals={animals}
            onSave={handleAddAnimal}
            onCancel={() => setShowAddAnimal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
