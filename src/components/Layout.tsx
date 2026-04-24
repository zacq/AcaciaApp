import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import {
  Home,
  Users,
  BarChart3,
  StickyNote,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  Archive,
  Briefcase,
  Stethoscope,
  Activity,
  ArrowLeftRight,
  Baby,
  Scan,
  Scissors,
  Weight,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/app/home' },
    { icon: Users, label: 'Flock', path: '/app/flock' },
    { icon: BarChart3, label: 'Reporting', path: '/app/reporting' },
    { icon: StickyNote, label: 'Notes', path: '/app/notes' },
  ];

  const sidebarGroups = [
    {
      title: 'Flock Management',
      items: [
        { icon: Users, label: 'All Animals', path: '/app/flock' },
        { icon: Archive, label: 'Archive Flock', path: '/app/archive' },
        { icon: BookOpen, label: 'Animal Breeds', path: '/app/breeds' },
      ]
    },
    {
      title: 'Health & Operations',
      items: [
        { icon: Stethoscope, label: 'Treatments', path: '/app/treatments' },
        { icon: Activity, label: 'Health', path: '/app/health' },
        { icon: ArrowLeftRight, label: 'Movements', path: '/app/movements' },
        { icon: Baby, label: 'Lambing', path: '/app/lambing' },
        { icon: Scan, label: 'Pregnancy Scans', path: '/app/pregnancy-scans' },
        { icon: Scissors, label: 'Weaning', path: '/app/weaning' },
        { icon: Weight, label: 'Performance', path: '/app/performance' },
        { icon: Heart, label: 'Breeding', path: '/app/breeding' },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { icon: Briefcase, label: 'Medicine Cabinet', path: '/app/medicine-cabinet' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface border-b border-accent px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            <Menu size={24} className="text-primary" />
          </button>
          <h1 className="text-xl font-serif font-bold text-primary">AcaciaVeld</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 md:pl-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="bg-surface border-t border-accent fixed bottom-0 left-0 right-0 px-6 py-3 flex items-center justify-between z-30 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-primary-light/60"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 -mt-12 border-4 border-background"
        >
          <Plus size={24} />
        </button>
      </nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-surface z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-accent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="AcaciaVeld" className="w-10 h-10 rounded-xl object-cover" />
                  <span className="text-xl font-serif font-bold text-primary">AcaciaVeld</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-accent rounded-xl">
                  <X size={24} className="text-primary-light" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {sidebarGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light/40 mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => cn(
                            "flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all",
                            isActive ? "bg-accent text-primary" : "text-primary-light hover:bg-accent/50"
                          )}
                        >
                          <item.icon size={20} />
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-accent space-y-1">
                <NavLink
                  to="/app/account"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl font-medium text-primary-light hover:bg-accent/50"
                >
                  <User size={20} />
                  My Account
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  Log Out
                </button>
                <div className="px-4 py-2 text-[10px] text-primary-light/40 font-mono">
                  VERSION 1.0.0
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
