import React, { useState } from 'react';
import { Plus, Activity, AlertTriangle, CheckCircle, Clock, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

type HealthEvent = {
  id: string;
  animal_tag: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string;
  status: 'open' | 'monitoring' | 'resolved';
  date: string;
  notes?: string;
};

const eventTypes = ['Health Assessment', 'Injury', 'Disease Observation', 'Mortality', 'Vet Recommendation', 'Recovery Check'];
const severities = ['low', 'medium', 'high', 'critical'] as const;

const severityColors: Record<HealthEvent['severity'], string> = {
  low: 'bg-green-50 text-green-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
};

const statusIcons: Record<HealthEvent['status'], React.ReactNode> = {
  open: <AlertTriangle size={16} className="text-red-500" />,
  monitoring: <Clock size={16} className="text-amber-500" />,
  resolved: <CheckCircle size={16} className="text-green-500" />,
};

const mockEvents: HealthEvent[] = [];

export default function Health() {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    animal_tag: '', event_type: 'Health Assessment', severity: 'medium' as HealthEvent['severity'],
    symptoms: '', status: 'open' as HealthEvent['status'],
    date: format(new Date(), 'yyyy-MM-dd'), notes: '',
  });

  const filtered = mockEvents.filter(e =>
    e.animal_tag.toLowerCase().includes(search.toLowerCase()) ||
    e.event_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Health event logged! (Supabase integration pending)');
    setTab('list');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Health"
        action={
          <button
            onClick={() => setTab(tab === 'add' ? 'list' : 'add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            {tab === 'add' ? 'Cancel' : 'Log Event'}
          </button>
        }
      />

      {tab === 'add' ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary text-lg border-b border-accent pb-3">New Health Event</h3>
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
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Event Type</label>
              <select className="input-field" value={form.event_type}
                onChange={e => setForm({ ...form, event_type: e.target.value })}>
                {eventTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Severity</label>
              <select className="input-field" value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value as HealthEvent['severity'] })}>
                {severities.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Symptoms / Observations *</label>
              <textarea required rows={3} className="input-field resize-none" placeholder="Describe symptoms or observations..."
                value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Status</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as HealthEvent['status'] })}>
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Notes</label>
              <input className="input-field" placeholder="Additional notes..." value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 shadow-lg shadow-primary/20">Save Health Event</button>
        </form>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              type="text" placeholder="Search by tag or event type..." className="input-field pl-12" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
              <Activity size={48} className="mx-auto text-accent mb-4" />
              <p className="text-primary-light font-medium">No health events recorded</p>
              <button onClick={() => setTab('add')} className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
                <Plus size={20} /> Log first event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(e => (
                <div key={e.id} className="card flex items-center gap-4">
                  <div className="shrink-0">{statusIcons[e.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary-dark">Tag: {e.animal_tag}</p>
                    <p className="text-sm text-primary-light">{e.event_type}</p>
                    <p className="text-xs text-primary-light/60 mt-0.5">{format(new Date(e.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize shrink-0 ${severityColors[e.severity]}`}>
                    {e.severity}
                  </span>
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
