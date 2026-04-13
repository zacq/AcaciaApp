import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Animal } from '../types';
import {
  ArrowLeft, Edit2, Calendar, Weight, Activity, Heart,
  Info, Stethoscope, Users, Baby, Scan, ArrowLeftRight, FileText
} from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';

type Tab = 'overview' | 'treatments' | 'health' | 'breeding' | 'lambing' | 'movements' | 'weights';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
  { id: 'treatments', label: 'Treatments', icon: <Stethoscope size={16} /> },
  { id: 'health', label: 'Health', icon: <Activity size={16} /> },
  { id: 'breeding', label: 'Breeding', icon: <Heart size={16} /> },
  { id: 'lambing', label: 'Lambing', icon: <Baby size={16} /> },
  { id: 'movements', label: 'Movements', icon: <ArrowLeftRight size={16} /> },
  { id: 'weights', label: 'Weights', icon: <Weight size={16} /> },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  sold: 'bg-blue-100 text-blue-700',
  dead: 'bg-gray-100 text-gray-600',
  culled: 'bg-orange-100 text-orange-700',
  archived: 'bg-accent text-primary-light',
};

const healthColors: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700',
  under_treatment: 'bg-amber-100 text-amber-700',
  monitor: 'bg-blue-100 text-blue-700',
  critical: 'bg-red-100 text-red-700',
};

export default function AnimalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!id || !db) { setLoading(false); return; }
    const unsubscribe = onSnapshot(doc(db, 'animals', id), (snap) => {
      if (snap.exists()) setAnimal({ id: snap.id, ...snap.data() } as Animal);
      setLoading(false);
    }, (err) => {
      console.warn('Animal profile fetch error (will work after Supabase):', err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-48 bg-accent/20 rounded-3xl animate-pulse" />
      <div className="h-12 bg-accent/20 rounded-2xl animate-pulse" />
      <div className="h-32 bg-accent/20 rounded-3xl animate-pulse" />
    </div>
  );

  if (!animal) return (
    <div className="p-6 text-center py-20">
      <p className="text-primary-light font-medium">Animal not found</p>
      <button onClick={() => navigate('/app/flock')} className="mt-4 btn-primary">Back to Flock</button>
    </div>
  );

  const ageMonths = animal.birth_date
    ? differenceInMonths(new Date(), new Date(animal.birth_date))
    : null;

  const ageLabel = ageMonths !== null
    ? ageMonths >= 12 ? `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m` : `${ageMonths}m`
    : '—';

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-6">
      {/* Hero Header */}
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
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl backdrop-blur-md border border-white/30">
            {animal.species === 'Goat' ? '🐐' : animal.species === 'Cattle' ? '🐄' : '🐑'}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Tag: {animal.tag_number}</h1>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {animal.breed}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {animal.sex}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {animal.species}
              </span>
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
              {t.icon}
              {t.label}
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
                  { label: 'Species', value: animal.species },
                  { label: 'Breed', value: animal.breed },
                  { label: 'Sex', value: animal.sex?.charAt(0).toUpperCase() + animal.sex?.slice(1) },
                  { label: 'Birth Date', value: animal.birth_date ? format(new Date(animal.birth_date), 'dd MMM yyyy') : 'Unknown' },
                  { label: 'Breeding Status', value: animal.breeding_status || 'Open' },
                  { label: 'Health Status', value: animal.health_status?.replace('_', ' ') || 'Healthy' },
                ].map(item => (
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
                <Activity size={18} className="text-amber-600 shrink-0" />
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

        {activeTab === 'treatments' && (
          <EmptyTab
            icon={<Stethoscope size={40} className="text-accent" />}
            label="No treatments recorded"
            sub="Treatment records will appear here once data is connected"
          />
        )}

        {activeTab === 'health' && (
          <EmptyTab
            icon={<Activity size={40} className="text-accent" />}
            label="No health events"
            sub="Health events will appear here once data is connected"
          />
        )}

        {activeTab === 'breeding' && (
          <EmptyTab
            icon={<Heart size={40} className="text-accent" />}
            label="No breeding records"
            sub="Breeding history will appear here once data is connected"
          />
        )}

        {activeTab === 'lambing' && (
          <EmptyTab
            icon={<Baby size={40} className="text-accent" />}
            label="No lambing records"
            sub="Lambing events for this animal will appear here"
          />
        )}

        {activeTab === 'movements' && (
          <EmptyTab
            icon={<ArrowLeftRight size={40} className="text-accent" />}
            label="No movement history"
            sub="Movement records will appear here once data is connected"
          />
        )}

        {activeTab === 'weights' && (
          <EmptyTab
            icon={<Weight size={40} className="text-accent" />}
            label="No weight records"
            sub="Weight history will appear here once data is connected"
          />
        )}
      </div>
    </div>
  );
}

function EmptyTab({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-dashed border-accent">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="font-medium text-primary-light">{label}</p>
      <p className="text-xs text-primary-light/60 mt-1 max-w-xs mx-auto">{sub}</p>
    </div>
  );
}
