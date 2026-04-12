import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Animal } from '../types';
import { ArrowLeft, Edit2, Calendar, Weight, Activity, Heart, Info } from 'lucide-react';

export default function AnimalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'animals', id), (doc) => {
      if (doc.exists()) {
        setAnimal({ id: doc.id, ...doc.data() } as Animal);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!animal) return <div className="p-6 text-center">Animal not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-white p-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-serif font-bold">Animal Profile</h2>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Edit2 size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl mb-4 backdrop-blur-md border border-white/30">
            🐑
          </div>
          <h1 className="text-3xl font-serif font-bold mb-1">Tag: {animal.tag_number}</h1>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              {animal.breed}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              {animal.sex}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex flex-col items-center gap-2 py-6">
            <Weight size={24} className="text-blue-600" />
            <span className="text-2xl font-bold text-primary-dark">{animal.weight_kg || '--'} kg</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60">Current Weight</span>
          </div>
          <div className="card flex flex-col items-center gap-2 py-6">
            <Activity size={24} className="text-green-600" />
            <span className="text-sm font-bold text-primary-dark uppercase">{animal.status}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60">Status</span>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3 border-b border-accent pb-4">
            <Info size={20} className="text-primary-light" />
            <h3 className="font-serif font-bold text-primary">Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-1">Species</p>
              <p className="font-bold text-primary-dark">{animal.species}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-1">Birth Date</p>
              <p className="font-bold text-primary-dark">{animal.birth_date || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-1">Breeding Status</p>
              <p className="font-bold text-primary-dark">{animal.breeding_status || 'Open'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60 mb-1">Health Status</p>
              <p className="font-bold text-primary-dark">{animal.health_status || 'Healthy'}</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3 border-b border-accent pb-4">
            <Heart size={20} className="text-red-500" />
            <h3 className="font-serif font-bold text-primary">Recent Treatments</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-primary-light/60 italic">No recent treatments recorded</p>
          </div>
        </div>
      </div>
    </div>
  );
}
