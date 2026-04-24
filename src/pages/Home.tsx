import React from 'react';
import {
  Stethoscope, Activity, BarChart3, Users, ArrowLeftRight,
  Baby, Scan, Scissors, ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const quickActions = [
  { icon: Stethoscope, label: 'Treatments',     path: '/app/treatments',       color: 'text-blue-600',   bg: 'bg-blue-50' },
  { icon: Activity,    label: 'Health',          path: '/app/health',           color: 'text-red-600',    bg: 'bg-red-50' },
  { icon: BarChart3,   label: 'Performance',     path: '/app/performance',      color: 'text-green-600',  bg: 'bg-green-50' },
  { icon: Users,       label: 'Breeding',        path: '/app/breeding',         color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: ArrowLeftRight, label: 'Movements',    path: '/app/movements',        color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Baby,        label: 'Lambing',         path: '/app/lambing',          color: 'text-pink-600',   bg: 'bg-pink-50' },
  { icon: Scan,        label: 'Pregnancy Scan',  path: '/app/pregnancy-scans',  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: Scissors,    label: 'Weaning',         path: '/app/weaning',          color: 'text-amber-600',  bg: 'bg-amber-50' },
];

const modules = [
  {
    label: 'Acacia Sheep',
    emoji: '🐑',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    path: '/app/flock?species=sheep',
  },
  {
    label: 'Acacia Beef',
    emoji: '🐄',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    path: '/app/flock?species=beef',
  },
  {
    label: 'Acacia Goat',
    emoji: '🐐',
    bg: 'bg-stone-50',
    border: 'border-stone-300',
    text: 'text-stone-700',
    path: '/app/flock?species=goat',
  },
];

export default function Home() {
  const { profile } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block mb-4"
        >
          <img src="/logo.png" alt="AcaciaVelds Logo"
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-surface" />
        </motion.div>
        <p className="text-primary-light font-medium mb-6">
          {profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'AcaciaVeld Ranch Operations'}
        </p>

        {/* Module icons */}
        <div className="flex justify-center gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={mod.path} className="flex flex-col items-center gap-2 group">
                <div className={`w-20 h-20 rounded-full border-2 ${mod.bg} ${mod.border} flex items-center justify-center text-4xl shadow-sm transition-transform group-hover:scale-105 group-active:scale-95`}>
                  {mod.emoji}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${mod.text}`}>
                  {mod.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={action.path}
              className="card flex flex-col items-center justify-center gap-4 py-8 aspect-square group">
              <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <action.icon size={28} className={action.color} />
              </div>
              <span className="font-bold text-sm text-primary-dark">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Recent Activity placeholder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-serif text-primary">Recent Activity</h3>
          <button className="text-sm font-bold text-primary-light hover:text-primary transition-colors">View All</button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <ClipboardList size={20} className="text-primary-light" />
              </div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-accent rounded-full mb-2 animate-pulse" />
                <div className="h-3 w-24 bg-accent/50 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
