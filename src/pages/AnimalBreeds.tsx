import React, { useState } from 'react';
import { Plus, BookOpen, Search, Trash2, Edit2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

type Breed = { id: string; name: string; species: string; description?: string };

const defaultBreeds: Breed[] = [
  { id: '1', name: 'Merino', species: 'Sheep', description: 'Fine wool breed' },
  { id: '2', name: 'Dorper', species: 'Sheep', description: 'Meat breed, heat-hardy' },
  { id: '3', name: 'Boer', species: 'Goat', description: 'Meat goat breed' },
  { id: '4', name: 'Angora', species: 'Goat', description: 'Mohair producing breed' },
  { id: '5', name: 'Angus', species: 'Cattle', description: 'Beef breed' },
];

export default function AnimalBreeds() {
  const [breeds, setBreeds] = useState<Breed[]>(defaultBreeds);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', species: 'Sheep', description: '' });

  const filtered = breeds.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.species.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setBreeds([...breeds, { id: Date.now().toString(), ...form }]);
    setForm({ name: '', species: 'Sheep', description: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setBreeds(breeds.filter(b => b.id !== id));
  };

  const speciesGroups = [...new Set(filtered.map(b => b.species))];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Animal Breeds"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Breed'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary border-b border-accent pb-3">New Breed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Breed Name *</label>
              <input required className="input-field" placeholder="e.g. Merino" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Species *</label>
              <select className="input-field" value={form.species}
                onChange={e => setForm({ ...form, species: e.target.value })}>
                {['Sheep', 'Goat', 'Cattle', 'Pig', 'Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Description</label>
              <input className="input-field" placeholder="Brief description..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3">Save Breed</button>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          type="text" placeholder="Search breeds..." className="input-field pl-12" />
      </div>

      {speciesGroups.map(species => (
        <div key={species}>
          <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light/40 mb-2">{species}</h3>
          <div className="space-y-2">
            {filtered.filter(b => b.species === species).map(breed => (
              <div key={breed.id} className="card flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary-dark">{breed.name}</p>
                    {breed.description && <p className="text-xs text-primary-light">{breed.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(breed.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
