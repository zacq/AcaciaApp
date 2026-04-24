import React, { useEffect, useState } from 'react';
import { Archive, ChevronRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { supabase } from '../supabase';
import { Animal } from '../types';

type SpeciesTab = 'sheep' | 'beef' | 'goat';
type StatusFilter = 'all' | 'sold' | 'dead' | 'culled';

const SPECIES_TABS: { tab: SpeciesTab; label: string; species: string; emoji: string }[] = [
  { tab: 'sheep', label: 'Sheep',  species: 'Sheep',  emoji: '🐑' },
  { tab: 'beef',  label: 'Beef',   species: 'Cattle', emoji: '🐄' },
  { tab: 'goat',  label: 'Goat',   species: 'Goat',   emoji: '🐐' },
];

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'sold',   label: 'Sold' },
  { key: 'dead',   label: 'Deceased' },
  { key: 'culled', label: 'Culled' },
];

const statusBadge: Record<string, string> = {
  sold:     'bg-blue-50 text-blue-700',
  dead:     'bg-gray-100 text-gray-500',
  culled:   'bg-orange-50 text-orange-700',
  archived: 'bg-purple-50 text-purple-700',
};

export default function ArchiveFlock() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesTab, setSpeciesTab] = useState<SpeciesTab>('sheep');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    supabase
      .from('animals')
      .select('*')
      .in('status', ['sold', 'dead', 'culled', 'archived'])
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setAnimals((data as Animal[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSearch('');
    setShowSearch(false);
    setStatusFilter('all');
  }, [speciesTab]);

  const activeSpecies = SPECIES_TABS.find(t => t.tab === speciesTab)!.species;

  const speciesAnimals = animals.filter(
    a => a.species?.toLowerCase() === activeSpecies.toLowerCase()
  );

  const statusFiltered =
    statusFilter === 'all'
      ? speciesAnimals
      : speciesAnimals.filter(a => a.status === statusFilter);

  const filtered = search
    ? statusFiltered.filter(
        a =>
          a.tag_number.toLowerCase().includes(search.toLowerCase()) ||
          a.breed?.toLowerCase().includes(search.toLowerCase()) ||
          a.name?.toLowerCase().includes(search.toLowerCase())
      )
    : statusFiltered;

  const speciesCount = (sp: string) =>
    animals.filter(a => a.species?.toLowerCase() === sp.toLowerCase()).length;

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-[49px] z-20 bg-background border-b border-accent/50">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
          <PageHeader title="Archive Flock" />

          {/* Species tabs + search toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-accent/30 p-1 rounded-2xl flex-1 gap-0.5">
              {SPECIES_TABS.map(({ tab, label, species, emoji }) => (
                <button
                  key={tab}
                  onClick={() => setSpeciesTab(tab)}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${speciesTab === tab ? 'bg-surface shadow-sm text-primary' : 'text-primary-light'}`}
                >
                  <span>{emoji}</span>
                  <span className="hidden sm:inline text-xs">{label}</span>
                  <span className="text-[10px] opacity-60">({speciesCount(species)})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(s => !s)}
              className={`p-2 rounded-xl transition-colors shrink-0 ${showSearch ? 'bg-primary text-white' : 'hover:bg-accent text-primary-light'}`}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Status pills */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_PILLS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${statusFilter === key ? 'bg-primary text-white' : 'bg-accent/50 text-primary-light hover:bg-accent'}`}
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-1 opacity-70">
                    ({speciesAnimals.filter(a => a.status === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Collapsible search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="relative pb-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light/40" size={16} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search archived animals…"
                    className="input-field pl-9 pr-9 py-2 text-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light/40 hover:text-primary-light"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-28">
        {loading ? (
          <table className="w-full text-sm mt-2">
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-accent/30">
                  <td className="py-3 pr-3 w-20"><div className="h-4 w-14 bg-accent/40 rounded animate-pulse" /></td>
                  <td className="py-3 pr-3"><div className="h-4 w-28 bg-accent/40 rounded animate-pulse" /></td>
                  <td className="py-3 pr-3 hidden sm:table-cell"><div className="h-4 w-20 bg-accent/30 rounded animate-pulse" /></td>
                  <td className="py-3 w-8"><div className="h-4 w-6 bg-accent/30 rounded animate-pulse mx-auto" /></td>
                  <td className="py-3 w-20"><div className="h-4 w-14 bg-accent/30 rounded animate-pulse mx-auto" /></td>
                  <td className="py-3 hidden sm:table-cell w-20"><div className="h-4 w-14 bg-accent/30 rounded animate-pulse ml-auto" /></td>
                  <td className="py-3 w-5" />
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-accent rounded-[2rem] mt-4">
            <Archive size={40} className="mx-auto text-accent mb-3" />
            <p className="text-primary-light font-medium text-sm">
              {search
                ? 'No animals match your search'
                : `No archived ${activeSpecies.toLowerCase()} — ${statusFilter === 'all' ? 'any status' : STATUS_PILLS.find(p => p.key === statusFilter)?.label}`}
            </p>
            <p className="text-xs text-primary-light/60 mt-1">
              Animals marked as sold, deceased, or culled appear here
            </p>
          </div>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="border-b-2 border-accent text-[10px] uppercase tracking-wider text-primary-light/50 font-bold">
                <th className="py-2 text-left pr-3">Tag</th>
                <th className="py-2 text-left pr-3">Name</th>
                <th className="py-2 text-left pr-3 hidden sm:table-cell">Breed</th>
                <th className="py-2 text-center w-8">Sex</th>
                <th className="py-2 text-center w-20">Status</th>
                <th className="py-2 text-right hidden sm:table-cell w-24">Date</th>
                <th className="w-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/30">
              {filtered.map(animal => (
                <tr
                  key={animal.id}
                  onClick={() => navigate(`/app/flock/animals/${animal.id}`, { state: { animal } })}
                  className="cursor-pointer hover:bg-accent/20 active:bg-accent/40 transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <span className="font-mono text-[11px] font-bold text-primary bg-accent/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {animal.tag_number}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold text-primary-dark text-[13px] leading-tight">
                      {animal.name || '—'}
                    </span>
                    <span className="sm:hidden block text-[10px] text-primary-light/60 leading-tight mt-0.5">
                      {animal.breed}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-primary-light text-xs hidden sm:table-cell">
                    {animal.breed}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${animal.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {animal.sex === 'male' ? 'M' : 'F'}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge[animal.status] ?? 'bg-accent text-primary-light'}`}>
                      {animal.status === 'dead' ? 'Deceased' : animal.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-xs text-primary-light hidden sm:table-cell whitespace-nowrap">
                    {animal.updated_at
                      ? new Date(animal.updated_at).toLocaleDateString('en-ZA', {
                          day: '2-digit', month: 'short', year: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="py-2.5 pl-1">
                    <ChevronRight size={15} className="text-accent" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
