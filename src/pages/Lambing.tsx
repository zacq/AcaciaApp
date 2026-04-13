import React, { useState } from 'react';
import { Plus, Baby, Search, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const mockLambing: any[] = [];

export default function Lambing() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({
    mother_tag: '', sire_tag: '', lambing_date: format(new Date(), 'yyyy-MM-dd'),
    born_total: '', born_alive: '', stillborn: '',
    male_count: '', female_count: '', complications: '',
    assistance: '', birth_weights: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Lambing record saved! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Lambing"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Add Record'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Lambing Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Mother Tag *</label>
              <input required className="input-field" placeholder="Dam tag number" value={form.mother_tag}
                onChange={e => setForm({ ...form, mother_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Sire Tag</label>
              <input className="input-field" placeholder="Sire tag number" value={form.sire_tag}
                onChange={e => setForm({ ...form, sire_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Lambing Date *</label>
              <input required type="date" className="input-field" value={form.lambing_date}
                onChange={e => setForm({ ...form, lambing_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Total Born</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.born_total}
                onChange={e => setForm({ ...form, born_total: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Born Alive</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.born_alive}
                onChange={e => setForm({ ...form, born_alive: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Stillborn</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.stillborn}
                onChange={e => setForm({ ...form, stillborn: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Male Count</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.male_count}
                onChange={e => setForm({ ...form, male_count: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Female Count</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.female_count}
                onChange={e => setForm({ ...form, female_count: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Birth Weights (kg)</label>
              <input className="input-field" placeholder="e.g. 4.2, 3.8" value={form.birth_weights}
                onChange={e => setForm({ ...form, birth_weights: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Complications</label>
              <input className="input-field" placeholder="Any complications during birth" value={form.complications}
                onChange={e => setForm({ ...form, complications: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Assistance Provided</label>
              <input className="input-field" placeholder="Type of assistance if any" value={form.assistance}
                onChange={e => setForm({ ...form, assistance: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Additional observations..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Lambing Record</button>
        </form>
      ) : (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
          <Baby size={48} className="mx-auto text-accent mb-4" />
          <p className="text-primary-light font-medium">No lambing records yet</p>
          <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Add first record
          </button>
        </div>
      )}
    </div>
  );
}
