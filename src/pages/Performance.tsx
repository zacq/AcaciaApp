import React, { useState } from 'react';
import { Plus, Weight, Search, TrendingUp, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const conditionScores = ['1 - Emaciated', '2 - Thin', '3 - Moderate', '4 - Good', '5 - Obese'];

export default function Performance() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({
    animal_tag: '', date: format(new Date(), 'yyyy-MM-dd'),
    weight: '', age_at_weighing: '', body_condition_score: '3 - Moderate',
    growth_notes: '', production_remarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Weight record saved! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Performance"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Record Weight'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Weight Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Animal Tag *</label>
              <input required className="input-field" placeholder="e.g. A-0042" value={form.animal_tag}
                onChange={e => setForm({ ...form, animal_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Date Weighed *</label>
              <input required type="date" className="input-field" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Weight (kg) *</label>
              <input required type="number" min="0" step="0.1" className="input-field" placeholder="e.g. 45.5" value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Age at Weighing (months)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 6" value={form.age_at_weighing}
                onChange={e => setForm({ ...form, age_at_weighing: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Body Condition Score</label>
              <select className="input-field" value={form.body_condition_score}
                onChange={e => setForm({ ...form, body_condition_score: e.target.value })}>
                {conditionScores.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Growth Notes</label>
              <input className="input-field" placeholder="Growth observations..." value={form.growth_notes}
                onChange={e => setForm({ ...form, growth_notes: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Production Remarks</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Performance or production notes..."
                value={form.production_remarks} onChange={e => setForm({ ...form, production_remarks: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Weight Record</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card flex flex-col items-center gap-2 py-6">
              <Weight size={28} className="text-primary" />
              <span className="text-2xl font-bold text-primary-dark">—</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60">Avg Weight</span>
            </div>
            <div className="card flex flex-col items-center gap-2 py-6">
              <TrendingUp size={28} className="text-green-600" />
              <span className="text-2xl font-bold text-primary-dark">—</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-light/60">Avg Daily Gain</span>
            </div>
          </div>
          <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-dashed border-accent">
            <Weight size={48} className="mx-auto text-accent mb-4" />
            <p className="text-primary-light font-medium">No weight records yet</p>
            <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
              <Plus size={20} /> Record first weight
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
