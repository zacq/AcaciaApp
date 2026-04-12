import React from 'react';
import { Briefcase, Plus, Search, AlertCircle } from 'lucide-react';

export default function MedicineCabinet() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-primary">Medicine Cabinet</h2>
        <button className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          className="input-field pl-12"
        />
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900">Low Stock Alert</h4>
          <p className="text-xs text-amber-800">3 medicines are running low on stock. Check inventory soon.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-accent">
          <Briefcase size={48} className="mx-auto text-accent mb-4" />
          <p className="text-primary-light font-medium">Your cabinet is empty</p>
          <button className="mt-4 text-primary font-bold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Add your first medicine
          </button>
        </div>
      </div>
    </div>
  );
}
