import React, { useState } from 'react';
import { Plus, Scissors, Search } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

export default function Weaning() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({
    offspring_tag: '', dam_tag: '', weaning_date: format(new Date(), 'yyyy-MM-dd'),
    age_at_weaning: '', weight_at_weaning: '', target_group: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Weaning record saved! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Weaning"
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
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Weaning Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Offspring Tag *</label>
              <input required className="input-field" placeholder="Lamb / kid tag" value={form.offspring_tag}
                onChange={e => setForm({ ...form, offspring_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Dam Tag</label>
              <input className="input-field" placeholder="Mother tag" value={form.dam_tag}
                onChange={e => setForm({ ...form, dam_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Weaning Date *</label>
              <input required type="date" className="input-field" value={form.weaning_date}
                onChange={e => setForm({ ...form, weaning_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Age at Weaning (days)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 90" value={form.age_at_weaning}
                onChange={e => setForm({ ...form, age_at_weaning: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Weight at Weaning (kg)</label>
              <input type="number" min="0" step="0.1" className="input-field" placeholder="e.g. 18.5" value={form.weight_at_weaning}
                onChange={e => setForm({ ...form, weight_at_weaning: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Target Group After Weaning</label>
              <input className="input-field" placeholder="Group name" value={form.target_group}
                onChange={e => setForm({ ...form, target_group: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Additional notes..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Weaning Record</button>
        </form>
      ) : (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
          <Scissors size={48} className="mx-auto text-accent mb-4" />
          <p className="text-primary-light font-medium">No weaning records yet</p>
          <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Add first record
          </button>
        </div>
      )}
    </div>
  );
}
