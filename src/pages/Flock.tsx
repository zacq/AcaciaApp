import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Animal } from '../types';
import { Plus, Search, Filter, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Flock() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'animals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const animalData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
      setAnimals(animalData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-primary">My Flock</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-surface border border-accent rounded-xl text-primary-light"><Search size={20} /></button>
          <button className="p-2 bg-surface border border-accent rounded-xl text-primary-light"><Filter size={20} /></button>
        </div>
      </div>

      <div className="flex bg-accent/30 p-1 rounded-2xl">
        <button className="flex-1 py-2 bg-surface shadow-sm rounded-xl font-bold text-primary text-sm">All Animals ({animals.length})</button>
        <button className="flex-1 py-2 text-primary-light font-bold text-sm">Groups</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 bg-accent/20 rounded-3xl animate-pulse" />)
        ) : animals.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
            <Users size={48} className="mx-auto text-accent mb-4" />
            <p className="text-primary-light font-medium">No animals found</p>
            <button className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
              <Plus size={20} /> Add your first animal
            </button>
          </div>
        ) : (
          animals.map((animal) => (
            <Link 
              key={animal.id} 
              to={`/app/flock/animals/${animal.id}`}
              className="card flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold">
                  {animal.tag_number.slice(-2)}
                </div>
                <div>
                  <h4 className="font-bold text-primary-dark">Tag: {animal.tag_number}</h4>
                  <p className="text-xs text-primary-light font-medium uppercase tracking-wider">{animal.breed} • {animal.sex}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-accent group-hover:text-primary transition-colors" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
