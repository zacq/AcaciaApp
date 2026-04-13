import React, { useState } from 'react';
import { User, Mail, Shield, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function Account() {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated! (Supabase integration pending)');
    setEditing(false);
  };

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Farm Manager',
    staff: 'Field Staff',
    vet: 'Vet / Specialist',
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <PageHeader title="My Account" />

      {/* Avatar */}
      <div className="card flex flex-col items-center gap-4 py-8">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold">
          {form.full_name?.charAt(0) || 'U'}
        </div>
        <div className="text-center">
          <p className="text-xl font-serif font-bold text-primary-dark">{form.full_name}</p>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-accent px-3 py-1 rounded-full">
            {roleLabel[profile?.role || ''] || profile?.role}
          </span>
        </div>
      </div>

      {/* Details */}
      {editing ? (
        <form onSubmit={handleSave} className="card space-y-4">
          <h3 className="font-serif font-bold text-primary border-b border-accent pb-3">Edit Profile</h3>
          <div>
            <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Full Name</label>
            <input className="input-field" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Email</label>
            <input type="email" className="input-field" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={18} /> Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-accent pb-3">
            <h3 className="font-serif font-bold text-primary">Profile Details</h3>
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-bold text-primary-light hover:text-primary">
              <Edit2 size={16} /> Edit
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <User size={18} className="text-primary-light" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-light/60 uppercase tracking-wider">Name</p>
                <p className="font-bold text-primary-dark">{form.full_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-primary-light" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-light/60 uppercase tracking-wider">Email</p>
                <p className="font-bold text-primary-dark">{form.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-primary-light" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-light/60 uppercase tracking-wider">Role</p>
                <p className="font-bold text-primary-dark">{roleLabel[profile?.role || ''] || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card space-y-2">
        <h3 className="font-serif font-bold text-primary border-b border-accent pb-3">App Info</h3>
        <div className="flex justify-between text-sm">
          <span className="text-primary-light">Version</span>
          <span className="font-bold text-primary-dark font-mono">1.0.0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-light">Ranch</span>
          <span className="font-bold text-primary-dark">AcaciaVeld</span>
        </div>
      </div>
    </div>
  );
}
