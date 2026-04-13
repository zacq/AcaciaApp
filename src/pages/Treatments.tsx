import React, { useState } from 'react';
import { Plus, Search, Filter, Stethoscope, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import PageHeader from '../components/PageHeader';

type TreatmentEntry = {
  id: string;
  animal_tag: string;
  medicine: string;
  dosage: string;
  route: string;
  reason: string;
  administered_by: string;
  date: string;
  withdrawal_days: number;
  withdrawal_end: string;
  notes?: string;
};

const mockTreatments: TreatmentEntry[] = [];

const routes = ['Injection (IM)', 'Injection (SC)', 'Oral', 'Topical', 'IV', 'Intranasal'];

export default function Treatments() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    animal_tag: '', medicine: '', dosage: '', route: 'Injection (IM)',
    reason: '', administered_by: '', date: format(new Date(), 'yyyy-MM-dd'),
    withdrawal_days: '', notes: '',
  });

  const filtered = mockTreatments.filter(t =>
    t.animal_tag.toLowerCase().includes(search.toLowerCase()) ||
    t.medicine.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Data will be saved to Supabase when integrated
    alert('Treatment recorded! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Treatments"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Add Treatment'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Treatment Record</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Animal Tag *</label>
              <input required className="input-field" placeholder="e.g. A-0042" value={form.animal_tag}
                onChange={e => setForm({ ...form, animal_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Date *</label>
              <input required type="date" className="input-field" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Medicine / Drug *</label>
              <input required className="input-field" placeholder="e.g. Oxytetracycline" value={form.medicine}
                onChange={e => setForm({ ...form, medicine: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Dosage</label>
              <input className="input-field" placeholder="e.g. 5ml/kg" value={form.dosage}
                onChange={e => setForm({ ...form, dosage: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Route</label>
              <select className="input-field" value={form.route}
                onChange={e => setForm({ ...form, route: e.target.value })}>
                {routes.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Withdrawal Days</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 21" value={form.withdrawal_days}
                onChange={e => setForm({ ...form, withdrawal_days: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Reason / Diagnosis</label>
              <input className="input-field" placeholder="e.g. Respiratory infection" value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Administered By</label>
              <input className="input-field" placeholder="Staff name or vet" value={form.administered_by}
                onChange={e => setForm({ ...form, administered_by: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Additional notes..." value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">
            Save Treatment Record
          </button>
        </form>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              type="text" placeholder="Search by tag or medicine..." className="input-field pl-12" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
              <Stethoscope size={48} className="mx-auto text-accent mb-4" />
              <p className="text-primary-light font-medium">No treatment records yet</p>
              <button
                onClick={() => setTab('add')}
                className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto"
              >
                <Plus size={20} /> Record first treatment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => (
                <div key={t.id} className="card flex items-center justify-between gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary-dark">Tag: {t.animal_tag}</p>
                    <p className="text-sm text-primary-light truncate">{t.medicine} · {t.route}</p>
                    <div className="flex items-center gap-1 text-xs text-primary-light/60 mt-1">
                      <Calendar size={12} />
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  {t.withdrawal_days > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full shrink-0">
                      <AlertTriangle size={12} />
                      {t.withdrawal_days}d
                    </div>
                  )}
                  <ChevronRight size={18} className="text-accent shrink-0" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
