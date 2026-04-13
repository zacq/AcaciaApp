import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Search, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const movementTypes = ['Group Transfer', 'Paddock Shift', 'Quarantine', 'Sales Prep', 'Purchase Arrival', 'Disposal / Exit', 'Death'];
const mockMovements: any[] = [];

export default function Movements() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    animal_tag: '', movement_type: 'Group Transfer', from_location: '',
    to_location: '', date: format(new Date(), 'yyyy-MM-dd'),
    authorized_by: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Movement recorded! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Movements"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Record Movement'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Movement Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Animal Tag / Group *</label>
              <input required className="input-field" placeholder="Tag or group name" value={form.animal_tag}
                onChange={e => setForm({ ...form, animal_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Date *</label>
              <input required type="date" className="input-field" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Movement Type</label>
              <select className="input-field" value={form.movement_type}
                onChange={e => setForm({ ...form, movement_type: e.target.value })}>
                {movementTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">From Location / Group</label>
              <input className="input-field" placeholder="e.g. Paddock A" value={form.from_location}
                onChange={e => setForm({ ...form, from_location: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">To Location / Group</label>
              <input className="input-field" placeholder="e.g. Paddock B" value={form.to_location}
                onChange={e => setForm({ ...form, to_location: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Authorized By</label>
              <input className="input-field" placeholder="Manager or vet name" value={form.authorized_by}
                onChange={e => setForm({ ...form, authorized_by: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Reason or additional notes..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Movement</button>
        </form>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              type="text" placeholder="Search movements..." className="input-field pl-12" />
          </div>
          <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
            <ArrowLeftRight size={48} className="mx-auto text-accent mb-4" />
            <p className="text-primary-light font-medium">No movement records yet</p>
            <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
              <Plus size={20} /> Record first movement
            </button>
          </div>
        </>
      )}
    </div>
  );
}
