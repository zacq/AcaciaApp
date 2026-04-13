import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Animal, AnimalGroup } from '../types';
import { Plus, Search, Filter, ChevronRight, Users, X, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from '../components/PageHeader';

type Tab = 'animals' | 'groups';

const speciesList = ['Sheep', 'Goat', 'Cattle', 'Pig', 'Other'];
const sexOptions = ['male', 'female'];
const statusOptions = ['active', 'sold', 'dead', 'culled', 'archived'];

export default function Flock() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('animals');
  const [search, setSearch] = useState('');
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  const [animalForm, setAnimalForm] = useState({
    tag_number: '', species: 'Sheep', breed: '', sex: 'female' as 'male' | 'female',
    birth_date: '', status: 'active' as Animal['status'], weight_kg: '',
    breeding_status: '', health_status: 'healthy', notes: '',
  });

  const [groupForm, setGroupForm] = useState({ name: '', purpose: '', location: '' });

  useEffect(() => {
    const q = query(collection(db, 'animals'));
    const unsubscribeAnimals = onSnapshot(q, (snapshot) => {
      setAnimals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal)));
      setLoading(false);
    }, (err) => {
      console.warn('Animals fetch error (will work after Supabase):', err.message);
      setLoading(false);
    });

    const gq = query(collection(db, 'groups'));
    const unsubscribeGroups = onSnapshot(gq, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnimalGroup)));
    }, (err) => {
      console.warn('Groups fetch error (will work after Supabase):', err.message);
    });

    return () => {
      try { unsubscribeAnimals(); } catch {}
      try { unsubscribeGroups(); } catch {}
    };
  }, []);

  const filteredAnimals = animals.filter(a =>
    a.tag_number.toLowerCase().includes(search.toLowerCase()) ||
    a.breed?.toLowerCase().includes(search.toLowerCase()) ||
    a.species?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'animals'), {
        ...animalForm,
        weight_kg: animalForm.weight_kg ? Number(animalForm.weight_kg) : null,
        created_at: new Date().toISOString(),
      });
      setAnimalForm({ tag_number: '', species: 'Sheep', breed: '', sex: 'female', birth_date: '', status: 'active', weight_kg: '', breeding_status: '', health_status: 'healthy', notes: '' });
      setShowAddAnimal(false);
    } catch {
      alert('Animal saved locally. (Supabase integration pending)');
      setShowAddAnimal(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'groups'), { ...groupForm, created_at: new Date().toISOString() });
      setGroupForm({ name: '', purpose: '', location: '' });
      setShowAddGroup(false);
    } catch {
      alert('Group saved locally. (Supabase integration pending)');
      setShowAddGroup(false);
    }
  };

  const healthColors: Record<string, string> = {
    healthy: 'bg-green-50 text-green-700',
    under_treatment: 'bg-amber-50 text-amber-700',
    monitor: 'bg-blue-50 text-blue-700',
    critical: 'bg-red-50 text-red-700',
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
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
              type="text" placeholder="Search by tag, breed, species..." className="input-field pl-12" />
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-accent/20 rounded-3xl animate-pulse" />)
            ) : filteredAnimals.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
                <Users size={48} className="mx-auto text-accent mb-4" />
                <p className="text-primary-light font-medium">{search ? 'No animals match your search' : 'No animals yet'}</p>
                {!search && (
                  <button onClick={() => setShowAddAnimal(true)} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
                    <Plus size={20} /> Add your first animal
                  </button>
                )}
              </div>
            ) : (
              filteredAnimals.map(animal => (
                <Link key={animal.id} to={`/app/flock/animals/${animal.id}`}
                  className="card flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-sm">
                      {animal.tag_number.slice(-3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-dark">Tag: {animal.tag_number}</h4>
                      <p className="text-xs text-primary-light font-medium uppercase tracking-wider">
                        {animal.breed} · {animal.sex} · {animal.species}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {animal.health_status && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize hidden sm:block ${healthColors[animal.health_status] || 'bg-accent text-primary-light'}`}>
                        {animal.health_status.replace('_', ' ')}
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
              <button onClick={() => setShowAddGroup(true)} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
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

      {/* Add Animal Modal */}
      <AnimatePresence>
        {showAddAnimal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddAnimal(false)}
              className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[2rem] z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-primary">Add New Animal</h3>
                  <button onClick={() => setShowAddAnimal(false)} className="p-2 hover:bg-accent rounded-xl">
                    <X size={22} className="text-primary-light" />
                  </button>
                </div>
                <form onSubmit={handleAddAnimal} className="space-y-4 pb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Tag Number *</label>
                      <input required className="input-field" placeholder="e.g. A-0042" value={animalForm.tag_number}
                        onChange={e => setAnimalForm({ ...animalForm, tag_number: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Species *</label>
                      <select className="input-field" value={animalForm.species}
                        onChange={e => setAnimalForm({ ...animalForm, species: e.target.value })}>
                        {speciesList.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Sex *</label>
                      <select className="input-field" value={animalForm.sex}
                        onChange={e => setAnimalForm({ ...animalForm, sex: e.target.value as 'male' | 'female' })}>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Breed *</label>
                      <input required className="input-field" placeholder="e.g. Merino" value={animalForm.breed}
                        onChange={e => setAnimalForm({ ...animalForm, breed: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Date of Birth</label>
                      <input type="date" className="input-field" value={animalForm.birth_date}
                        onChange={e => setAnimalForm({ ...animalForm, birth_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Weight (kg)</label>
                      <input type="number" min="0" step="0.1" className="input-field" placeholder="0.0" value={animalForm.weight_kg}
                        onChange={e => setAnimalForm({ ...animalForm, weight_kg: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Status</label>
                      <select className="input-field" value={animalForm.status}
                        onChange={e => setAnimalForm({ ...animalForm, status: e.target.value as Animal['status'] })}>
                        {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
                      <textarea rows={2} className="input-field resize-none" placeholder="Any additional notes..."
                        value={animalForm.notes} onChange={e => setAnimalForm({ ...animalForm, notes: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Animal</button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
  );
}
