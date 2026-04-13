import React, { useState } from 'react';
import { Plus, Scan, Search, ChevronRight, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

type ScanResult = 'positive' | 'negative' | 'inconclusive';

const resultDisplay: Record<ScanResult, { label: string; icon: React.ReactNode; color: string }> = {
  positive: { label: 'Positive', icon: <CheckCircle size={16} />, color: 'text-green-600 bg-green-50' },
  negative: { label: 'Negative', icon: <XCircle size={16} />, color: 'text-red-600 bg-red-50' },
  inconclusive: { label: 'Inconclusive', icon: <HelpCircle size={16} />, color: 'text-amber-600 bg-amber-50' },
};

const mockScans: any[] = [];

export default function PregnancyScans() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState({
    animal_tag: '', scan_date: format(new Date(), 'yyyy-MM-dd'),
    result: 'positive' as ScanResult, gestation_age: '',
    expected_due_date: '', technician: '', remarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Scan record saved! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Pregnancy Scans"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Add Scan'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Pregnancy Scan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Animal Tag *</label>
              <input required className="input-field" placeholder="Ewe / doe tag" value={form.animal_tag}
                onChange={e => setForm({ ...form, animal_tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Scan Date *</label>
              <input required type="date" className="input-field" value={form.scan_date}
                onChange={e => setForm({ ...form, scan_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Result *</label>
              <select className="input-field" value={form.result}
                onChange={e => setForm({ ...form, result: e.target.value as ScanResult })}>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="inconclusive">Inconclusive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Est. Gestation Age (days)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 60" value={form.gestation_age}
                onChange={e => setForm({ ...form, gestation_age: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Expected Due Date</label>
              <input type="date" className="input-field" value={form.expected_due_date}
                onChange={e => setForm({ ...form, expected_due_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Technician / Vet</label>
              <input className="input-field" placeholder="Name" value={form.technician}
                onChange={e => setForm({ ...form, technician: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Remarks</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Additional scan notes..."
                value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Scan Record</button>
        </form>
      ) : (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
          <Scan size={48} className="mx-auto text-accent mb-4" />
          <p className="text-primary-light font-medium">No pregnancy scan records</p>
          <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Record first scan
          </button>
        </div>
      )}
    </div>
  );
}
