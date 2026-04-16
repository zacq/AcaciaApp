import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Animal, AnimalImage, AnimalWeight, Treatment } from '../types';
import {
  ArrowLeft, Edit2, Calendar, Weight, Activity, Heart,
  Info, Stethoscope, Users, Baby, Scan, ArrowLeftRight, FileText,
  GitBranch, Image as ImageIcon, Camera, Plus, AlertCircle
} from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { supabase } from '../supabase';

type Tab =
  | 'overview'
  | 'pedigree'
  | 'photos'
  | 'treatments'
  | 'health'
  | 'breeding'
  | 'lambing'
  | 'movements'
  | 'weights';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',   icon: <Info size={16} /> },
  { id: 'pedigree',   label: 'Pedigree',   icon: <GitBranch size={16} /> },
  { id: 'photos',     label: 'Photos',     icon: <ImageIcon size={16} /> },
  { id: 'treatments', label: 'Treatments', icon: <Stethoscope size={16} /> },
  { id: 'health',     label: 'Health',     icon: <Activity size={16} /> },
  { id: 'breeding',   label: 'Breeding',   icon: <Heart size={16} /> },
  { id: 'lambing',    label: 'Lambing',    icon: <Baby size={16} /> },
  { id: 'movements',  label: 'Movements',  icon: <ArrowLeftRight size={16} /> },
  { id: 'weights',    label: 'Weights',    icon: <Weight size={16} /> },
];

const statusColors: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  sold:     'bg-blue-100 text-blue-700',
  dead:     'bg-gray-100 text-gray-600',
  culled:   'bg-orange-100 text-orange-700',
  archived: 'bg-accent text-primary-light',
};

const healthColors: Record<string, string> = {
  healthy:          'bg-green-100 text-green-700',
  under_treatment:  'bg-amber-100 text-amber-700',
  monitor:          'bg-blue-100 text-blue-700',
  critical:         'bg-red-100 text-red-700',
};

// ─── Pedigree Box ─────────────────────────────────────────────────────────────
function PedigreeBox({ label, tagNumber, pedigreeId, sex }: {
  label: string; tagNumber?: string; pedigreeId?: string; sex?: 'male' | 'female';
}) {
  const bg   = sex === 'male' ? 'bg-blue-50 border-blue-200' : sex === 'female' ? 'bg-pink-50 border-pink-200' : 'bg-accent border-accent';
  const text = sex === 'male' ? 'text-blue-700' : sex === 'female' ? 'text-pink-700' : 'text-primary-light';
  return (
    <div className={`rounded-xl border px-3 py-2 min-w-[100px] ${bg}`}>
      <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${text}`}>{label}</p>
      <p className="text-xs font-bold text-primary-dark truncate">{tagNumber || '—'}</p>
      {pedigreeId && <p className="text-[9px] text-primary-light truncate">{pedigreeId}</p>}
    </div>
  );
}

function PedigreeTab({ animal, sire, dam }: { animal: Animal; sire?: Animal; dam?: Animal }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-serif font-bold text-primary border-b border-accent pb-3 mb-4 flex items-center gap-2">
          <GitBranch size={18} /> Lineage
        </h3>
        <div className="flex flex-col items-center gap-4">
          <PedigreeBox label="Subject" tagNumber={animal.tag_number} pedigreeId={animal.pedigree_id} sex={animal.sex} />
          <div className="w-px h-6 bg-accent" />
          <div className="flex gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <PedigreeBox label="Sire" tagNumber={sire?.tag_number || '—'} pedigreeId={sire?.pedigree_id} sex="male" />
              {animal.sire_sire && (
                <>
                  <div className="w-px h-4 bg-accent" />
                  <PedigreeBox label="Sire-Sire" tagNumber={animal.sire_sire} sex="male" />
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <PedigreeBox label="Dam" tagNumber={dam?.tag_number || '—'} pedigreeId={dam?.pedigree_id} sex="female" />
              {animal.dam_sire && (
                <>
                  <div className="w-px h-4 bg-accent" />
                  <PedigreeBox label="Dam-Sire" tagNumber={animal.dam_sire} sex="male" />
                </>
              )}
            </div>
          </div>
        </div>
        {!sire && !dam && !animal.sire_sire && !animal.dam_sire && (
          <p className="text-xs text-primary-light/60 text-center mt-4">
            No parentage recorded. Edit animal to assign sire and dam.
          </p>
        )}
      </div>

      {(animal.registration_number || animal.pedigree_id || animal.breeding_class || animal.breeder_name) && (
        <div className="card space-y-3">
          <h3 className="font-serif font-bold text-primary border-b border-accent pb-3 flex items-center gap-2">
            <FileText size={18} /> Registration
          </h3>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { label: 'Pedigree ID',    value: animal.pedigree_id },
              { label: 'Reg. Number',    value: animal.registration_number },
              { label: 'Breeding Class', value: animal.breeding_class },
              { label: 'Breed %',        value: animal.breed_percentage ? `${animal.breed_percentage}%` : undefined },
              { label: 'Breeder',        value: animal.breeder_name },
              { label: 'Source Country', value: animal.source_country },
              { label: 'Born As',        value: animal.born_as },
              { label: 'Import Batch',   value: animal.import_batch },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-0.5">{item.label}</p>
                <p className="font-bold text-primary-dark capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────
function PhotosTab({ images }: { images: AnimalImage[] }) {
  const slots = ['front', 'side', 'rear'] as const;
  return (
    <div className="card space-y-4">
      <h3 className="font-serif font-bold text-primary border-b border-accent pb-3 flex items-center gap-2">
        <ImageIcon size={18} /> Animal Photos
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {slots.map(slot => {
          const img = images.find(i => i.slot === slot);
          return (
            <div key={slot} className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 text-center">{slot}</p>
              {img ? (
                <img src={img.file_url} alt={slot}
                  className="w-full aspect-square object-cover rounded-2xl border-2 border-accent" />
              ) : (
                <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-accent bg-accent/20 flex flex-col items-center justify-center gap-2">
                  <Camera size={20} className="text-primary-light/40" />
                  <span className="text-[9px] font-bold text-primary-light/40 uppercase">No photo</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Treatments Tab ───────────────────────────────────────────────────────────
function TreatmentsTab({ treatments, loading }: { treatments: Treatment[]; loading: boolean }) {
  if (loading) return <div className="h-20 bg-accent/20 rounded-3xl animate-pulse" />;
  if (treatments.length === 0) return (
    <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-dashed border-accent">
      <Stethoscope size={40} className="mx-auto text-accent mb-4" />
      <p className="font-medium text-primary-light">No treatments recorded</p>
      <p className="text-xs text-primary-light/60 mt-1">Add a treatment to track this animal's medical history</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {treatments.map(t => (
        <div key={t.id} className="card space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-primary-dark">{t.medicine_name || 'Treatment'}</p>
              {t.dosage && <p className="text-xs text-primary-light">{t.dosage}</p>}
            </div>
            <span className="text-[10px] font-bold text-primary-light bg-accent px-2 py-1 rounded-full">
              {format(new Date(t.treatment_date), 'dd MMM yyyy')}
            </span>
          </div>
          {t.withdrawal_end_date && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl text-xs font-medium text-amber-800">
              <AlertCircle size={14} />
              Withdrawal ends: {format(new Date(t.withdrawal_end_date), 'dd MMM yyyy')}
            </div>
          )}
          {t.notes && <p className="text-xs text-primary-light/70">{t.notes}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Weights Tab ──────────────────────────────────────────────────────────────
function WeightsTab({ weights, loading }: { weights: AnimalWeight[]; loading: boolean }) {
  if (loading) return <div className="h-20 bg-accent/20 rounded-3xl animate-pulse" />;
  if (weights.length === 0) return (
    <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-dashed border-accent">
      <Weight size={40} className="mx-auto text-accent mb-4" />
      <p className="font-medium text-primary-light">No weight records</p>
      <p className="text-xs text-primary-light/60 mt-1">Weight history and trend chart will appear here</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {weights.map((w, idx) => (
        <div key={w.id} className="card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Weight size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-primary-dark">{w.weight_kg} kg</p>
              {w.condition_score && (
                <p className="text-xs text-primary-light">BCS: {w.condition_score}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-primary-light">
              {format(new Date(w.recorded_at), 'dd MMM yyyy')}
            </p>
            {idx < weights.length - 1 && (
              <p className={`text-[10px] font-bold ${
                w.weight_kg > weights[idx + 1].weight_kg ? 'text-green-600' : 'text-red-600'
              }`}>
                {w.weight_kg > weights[idx + 1].weight_kg ? '+' : ''}
                {(w.weight_kg - weights[idx + 1].weight_kg).toFixed(1)} kg
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Generic empty tab ────────────────────────────────────────────────────────
function EmptyTab({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-dashed border-accent">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="font-medium text-primary-light">{label}</p>
      <p className="text-xs text-primary-light/60 mt-1 max-w-xs mx-auto">{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnimalProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [animal, setAnimal] = useState<Animal | null>(
    () => (location.state as { animal?: Animal })?.animal ?? null
  );
  const [sire,   setSire]   = useState<Animal | null>(null);
  const [dam,    setDam]    = useState<Animal | null>(null);
  const [images, setImages] = useState<AnimalImage[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [weights,    setWeights]    = useState<AnimalWeight[]>([]);

  const [loadingAnimal,     setLoadingAnimal]     = useState(!animal);
  const [loadingImages,     setLoadingImages]     = useState(true);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [loadingWeights,    setLoadingWeights]    = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Fetch animal if not passed via location state
  useEffect(() => {
    if (!id) return;
    if (animal) {
      setLoadingAnimal(false);
      return;
    }
    setLoadingAnimal(true);
    supabase.from('animals').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setAnimal(data as Animal);
        setLoadingAnimal(false);
      });
  }, [id]);

  // Fetch images
  useEffect(() => {
    if (!id) return;
    supabase.from('animal_images').select('*').eq('animal_id', id).order('slot')
      .then(({ data }) => {
        if (data) setImages(data as AnimalImage[]);
        setLoadingImages(false);
      });
  }, [id]);

  // Fetch parents once animal is loaded
  useEffect(() => {
    if (!animal) return;
    if (animal.sire_id) {
      supabase.from('animals').select('id,tag_number,name,pedigree_id,sex').eq('id', animal.sire_id).single()
        .then(({ data }) => { if (data) setSire(data as Animal); });
    }
    if (animal.dam_id) {
      supabase.from('animals').select('id,tag_number,name,pedigree_id,sex').eq('id', animal.dam_id).single()
        .then(({ data }) => { if (data) setDam(data as Animal); });
    }
  }, [animal?.sire_id, animal?.dam_id]);

  // Fetch treatments / weights lazily when tab is opened
  useEffect(() => {
    if (!id) return;
    if (activeTab === 'treatments' && treatments.length === 0) {
      setLoadingTreatments(true);
      supabase.from('treatments').select('*').eq('animal_id', id).order('treatment_date', { ascending: false })
        .then(({ data }) => {
          if (data) setTreatments(data as Treatment[]);
          setLoadingTreatments(false);
        });
    }
    if (activeTab === 'weights' && weights.length === 0) {
      setLoadingWeights(true);
      supabase.from('animal_weights').select('*').eq('animal_id', id).order('recorded_at', { ascending: false })
        .then(({ data }) => {
          if (data) setWeights(data as AnimalWeight[]);
          setLoadingWeights(false);
        });
    }
  }, [activeTab, id]);

  if (loadingAnimal) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!animal) return (
    <div className="p-6 text-center py-20">
      <p className="text-primary-light font-medium">Animal not found</p>
      <button onClick={() => navigate('/app/flock')} className="btn-primary mt-6">Back to Flock</button>
    </div>
  );

  const ageMonths = animal.birth_date
    ? differenceInMonths(new Date(), new Date(animal.birth_date))
    : null;
  const ageLabel = ageMonths !== null
    ? ageMonths >= 12 ? `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m` : `${ageMonths}m`
    : '—';

  const primaryImage = images.find(i => i.is_primary) ?? images[0];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-6">
      {/* Hero */}
      <div className="bg-primary text-white px-4 pt-4 pb-10 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-serif font-bold">Animal Profile</h2>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Edit2 size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl backdrop-blur-md border border-white/30 overflow-hidden">
            {primaryImage
              ? <img src={primaryImage.file_url} alt="animal" className="w-full h-full object-cover" />
              : (animal.species === 'Goat' ? '🐐' : animal.species === 'Cattle' ? '🐄' : '🐑')
            }
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">{animal.name || `Tag: ${animal.tag_number}`}</h1>
            <p className="text-white/70 text-sm mt-0.5">{animal.tag_number}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{animal.breed}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{animal.sex}</span>
              {animal.breeding_class && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{animal.breeding_class}</span>
              )}
              {animal.cull && (
                <span className="bg-orange-400/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Cull</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 -mt-6 grid grid-cols-3 gap-3 mb-4">
        <div className="card flex flex-col items-center gap-1 py-4 shadow-md">
          <Weight size={18} className="text-blue-500" />
          <span className="text-lg font-bold text-primary-dark">{animal.weight_kg ? `${animal.weight_kg}kg` : '—'}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary-light/60">Weight</span>
        </div>
        <div className="card flex flex-col items-center gap-1 py-4 shadow-md">
          <Calendar size={18} className="text-amber-500" />
          <span className="text-lg font-bold text-primary-dark">{ageLabel}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary-light/60">Age</span>
        </div>
        <div className="card flex flex-col items-center gap-1 py-4 shadow-md">
          <Activity size={18} className="text-green-500" />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize text-center ${statusColors[animal.status] || 'bg-accent text-primary-light'}`}>
            {animal.status}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary-light/60">Status</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === t.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface border border-accent text-primary-light hover:text-primary'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4 space-y-4">

        {activeTab === 'overview' && (
          <>
            <div className="card space-y-4">
              <h3 className="font-serif font-bold text-primary border-b border-accent pb-3 flex items-center gap-2">
                <Info size={18} /> Details
              </h3>
              <div className="grid grid-cols-2 gap-y-4">
                {[
                  { label: 'Species',         value: animal.species },
                  { label: 'Breed',           value: animal.breed },
                  { label: 'Sex',             value: animal.sex?.charAt(0).toUpperCase() + animal.sex?.slice(1) },
                  { label: 'Born As',         value: animal.born_as },
                  { label: 'DOB',             value: animal.birth_date ? format(new Date(animal.birth_date), 'dd MMM yyyy') : undefined },
                  { label: 'Breeding Status', value: animal.breeding_status || 'Open' },
                  { label: 'Health Status',   value: animal.health_status?.replace('_', ' ') || 'Healthy' },
                  { label: 'Pedigree ID',     value: animal.pedigree_id },
                  { label: 'Reg. Number',     value: animal.registration_number },
                  { label: 'Visual ID',       value: animal.visual_id },
                  { label: 'EID',             value: animal.eid },
                  { label: 'Scrapie Tag',     value: animal.scrapie_tag },
                  { label: 'Breeder',         value: animal.breeder_name },
                  { label: 'Color',           value: animal.color_markings },
                ].filter(i => i.value).map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-0.5">{item.label}</p>
                    <p className="font-bold text-primary-dark capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {animal.health_status && animal.health_status !== 'healthy' && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${healthColors[animal.health_status]}`}>
                <Activity size={18} />
                <p className="text-sm font-bold capitalize">{animal.health_status.replace('_', ' ')}</p>
              </div>
            )}

            {animal.withdrawal_status && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">In Withdrawal Period</p>
                  {animal.withdrawal_end_date && (
                    <p className="text-xs text-amber-700">Ends: {format(new Date(animal.withdrawal_end_date), 'dd MMM yyyy')}</p>
                  )}
                </div>
              </div>
            )}

            {animal.notes && (
              <div className="card">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-2">Notes</p>
                <p className="text-primary-dark text-sm">{animal.notes}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'pedigree' && (
          <PedigreeTab animal={animal} sire={sire ?? undefined} dam={dam ?? undefined} />
        )}

        {activeTab === 'photos' && (
          <PhotosTab images={loadingImages ? [] : images} />
        )}

        {activeTab === 'treatments' && (
          <TreatmentsTab treatments={treatments} loading={loadingTreatments} />
        )}

        {activeTab === 'health' && (
          <EmptyTab icon={<Activity size={40} className="text-accent" />}
            label="No health events" sub="Health events will appear here" />
        )}

        {activeTab === 'breeding' && (
          <EmptyTab icon={<Heart size={40} className="text-accent" />}
            label="No breeding records" sub="Breeding history will appear here" />
        )}

        {activeTab === 'lambing' && (
          <EmptyTab icon={<Baby size={40} className="text-accent" />}
            label="No lambing records" sub="Lambing events will appear here" />
        )}

        {activeTab === 'movements' && (
          <EmptyTab icon={<ArrowLeftRight size={40} className="text-accent" />}
            label="No movement history" sub="Movement records will appear here" />
        )}

        {activeTab === 'weights' && (
          <WeightsTab weights={weights} loading={loadingWeights} />
        )}

      </div>
    </div>
  );
}
