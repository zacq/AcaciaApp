import React, { useState } from 'react';
import { Plus, Users, Search, ChevronRight, Heart } from 'lucide-react';
import { format, addDays } from 'date-fns';
import PageHeader from '../components/PageHeader';

const matingTypes = ['Natural', 'Artificial Insemination', 'Embryo Transfer'];
const mockBreeding: any[] = [];

export default function Breeding() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({
    sire_tag: '', dam_tag: '', breeding_date: format(new Date(), 'yyyy-MM-dd'),
    mating_type: 'Natural', expected_due_date: '', technician: '',
    outcome: '', notes: '',
  });

  // Auto-calculate expected due date (~147 days for sheep)
  const handleBreedingDateChange = (date: string) => {
    const due = date ? format(addDays(new Date(date), 147), 'yyyy-MM-dd') : '';
    setForm({ ...form, breeding_date: date, expected_due_date: due });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Breeding record saved! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Breeding"
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
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Breeding Record</h3>

          {form.expected_due_date && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              <Heart size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Expected Due Date</p>
                <p className="font-bold text-green-900">{format(new Date(form.expected_due_date), 'dd MMM yyyy')}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Sire Tag *</label>
              <input required className="input-field" placeholder="Ram / buck tag" value={form.sire_tag}
                onChange={e => setForm({ ...form, sire_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Dam Tag *</label>
              <input required className="input-field" placeholder="Ewe / doe tag" value={form.dam_tag}
                onChange={e => setForm({ ...form, dam_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Breeding Date *</label>
              <input required type="date" className="input-field" value={form.breeding_date}
                onChange={e => handleBreedingDateChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Mating Type</label>
              <select className="input-field" value={form.mating_type}
                onChange={e => setForm({ ...form, mating_type: e.target.value })}>
                {matingTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Expected Due Date</label>
              <input type="date" className="input-field" value={form.expected_due_date}
                onChange={e => setForm({ ...form, expected_due_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Technician / Handler</label>
              <input className="input-field" placeholder="Name" value={form.technician}
                onChange={e => setForm({ ...form, technician: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Outcome</label>
              <input className="input-field" placeholder="Result if known" value={form.outcome}
                onChange={e => setForm({ ...form, outcome: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Breeding notes..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Breeding Record</button>
        </form>
      ) : (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
          <Users size={48} className="mx-auto text-accent mb-4" />
          <p className="text-primary-light font-medium">No breeding records yet</p>
          <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Add first record
          </button>
        </div>
      )}
    </div>
  );
}
