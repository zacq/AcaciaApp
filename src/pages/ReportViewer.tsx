import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

const reportMeta: Record<string, { title: string; description: string }> = {
  'animals-in-flock': { title: 'Animals in Flock', description: 'Complete list of all active animals currently in the flock.' },
  'animals-by-group': { title: 'Animals by Group', description: 'Breakdown of animals sorted by their assigned groups.' },
  'medicines-purchased': { title: 'Medicines Purchased', description: 'History of all medicine purchases from the cabinet.' },
  'treatments': { title: 'Treatments Report', description: 'All treatment records within the selected date range.' },
  'service-report': { title: 'Service Report', description: 'Summary of all operational activities and services performed.' },
  'movements': { title: 'Movements Report', description: 'Log of all animal movements between groups, paddocks, or locations.' },
  'weight-recording': { title: 'Weight Recording', description: 'Historical weight data and growth performance records.' },
  'replaced-tags': { title: 'Replaced Tags', description: 'List of animals that had ear tags replaced.' },
  'mortality': { title: 'Mortality Report', description: 'Record of all animal deaths on the ranch.' },
  'health-assessment': { title: 'Health Assessment Report', description: 'Summary of all health events and assessments.' },
  'animals-born-on-farm': { title: 'Animals Born on Farm', description: 'All animals that were born on AcaciaVeld.' },
  'lambing-record': { title: 'Lambing Record', description: 'Complete lambing event history with outcomes.' },
  'cull-report': { title: 'Cull Report', description: 'Records of all culled animals and reasons.' },
  'pregnancy-scan': { title: 'Pregnancy Scan Report', description: 'Results from all pregnancy scans conducted.' },
  'expired-medicines': { title: 'Expired Medicines', description: 'List of medicines that have passed their expiry date.' },
  'animals-in-withdrawal': { title: 'Animals in Withdrawal', description: 'Animals currently under a medicine withdrawal period.' },
};

export default function ReportViewer() {
  const { reportType } = useParams<{ reportType: string }>();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');

  const meta = reportType ? reportMeta[reportType] : null;

  if (!meta) {
    return (
      <div className="p-6 text-center">
        <p className="text-primary-light">Report not found.</p>
        <button onClick={() => navigate('/app/reporting')} className="mt-4 btn-primary">Back to Reports</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/reporting')} className="p-2 hover:bg-accent rounded-xl transition-colors">
          <ArrowLeft size={22} className="text-primary" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-serif font-bold text-primary truncate">{meta.title}</h2>
          <p className="text-xs text-primary-light">{meta.description}</p>
        </div>
        <button className="p-2 hover:bg-accent rounded-xl transition-colors" title="Export">
          <Download size={20} className="text-primary-light" />
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-light uppercase tracking-wider">
          <Filter size={14} />
          Filters
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-primary-light mb-1">From</label>
            <input type="date" className="input-field text-sm" value={dateFrom}
              onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-primary-light mb-1">To</label>
            <input type="date" className="input-field text-sm" value={dateTo}
              onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light/40" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            type="text" placeholder="Search within report..." className="input-field pl-9 text-sm" />
        </div>
        <button className="btn-primary w-full py-3 text-sm">Generate Report</button>
      </div>

      {/* Empty state — data will populate from Supabase */}
      <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
        <FileText size={48} className="mx-auto text-accent mb-4" />
        <p className="font-medium text-primary-light">No data for this report yet</p>
        <p className="text-xs text-primary-light/60 mt-1">Data will appear here once Supabase is connected</p>
      </div>
    </div>
  );
}
