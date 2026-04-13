import React, { useState } from 'react';
import { Archive, Search, Filter } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function ArchiveFlock() {
  const [search, setSearch] = useState('');

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Archive Flock"
        action={
          <button className="p-2 bg-surface border border-accent rounded-xl text-primary-light">
            <Filter size={20} />
          </button>
        }
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          type="text" placeholder="Search archived animals..." className="input-field pl-12" />
      </div>

      <div className="flex bg-accent/30 p-1 rounded-2xl gap-1">
        {['Sold', 'Deceased', 'Culled', 'All'].map(s => (
          <button key={s} className="flex-1 py-2 text-sm font-bold text-primary-light rounded-xl hover:bg-surface transition-colors">
            {s}
          </button>
        ))}
      </div>

      <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
        <Archive size={48} className="mx-auto text-accent mb-4" />
        <p className="text-primary-light font-medium">No archived animals</p>
        <p className="text-sm text-primary-light/60 mt-1">Animals marked as sold, deceased, or culled appear here</p>
      </div>
    </div>
  );
}
