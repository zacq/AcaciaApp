/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Flock from './pages/Flock';
import AnimalProfile from './pages/AnimalProfile';
import Notes from './pages/Notes';
import Reporting from './pages/Reporting';
import MedicineCabinet from './pages/MedicineCabinet';
import Treatments from './pages/Treatments';
import Health from './pages/Health';
import Movements from './pages/Movements';
import Lambing from './pages/Lambing';
import PregnancyScans from './pages/PregnancyScans';
import Weaning from './pages/Weaning';
import Performance from './pages/Performance';
import Breeding from './pages/Breeding';
import ArchiveFlock from './pages/ArchiveFlock';
import AnimalBreeds from './pages/AnimalBreeds';
import Account from './pages/Account';
import ReportViewer from './pages/ReportViewer';

// Auth temporarily deactivated — uncomment ProtectedRoute usage below when sign-in is ready
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   return <>{children}</>;
// }

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Auth guard deactivated: was <ProtectedRoute><Layout /></ProtectedRoute> */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />

            {/* Flock */}
            <Route path="flock" element={<Flock />} />
            <Route path="flock/animals/:id" element={<AnimalProfile />} />
            <Route path="archive" element={<ArchiveFlock />} />
            <Route path="breeds" element={<AnimalBreeds />} />

            {/* Core operations */}
            <Route path="treatments" element={<Treatments />} />
            <Route path="health" element={<Health />} />
            <Route path="movements" element={<Movements />} />
            <Route path="lambing" element={<Lambing />} />
            <Route path="pregnancy-scans" element={<PregnancyScans />} />
            <Route path="weaning" element={<Weaning />} />
            <Route path="performance" element={<Performance />} />
            <Route path="breeding" element={<Breeding />} />

            {/* Reporting & inventory */}
            <Route path="reporting" element={<Reporting />} />
            <Route path="reporting/:reportType" element={<ReportViewer />} />
            <Route path="notes" element={<Notes />} />
            <Route path="medicine-cabinet" element={<MedicineCabinet />} />

            {/* Account */}
            <Route path="account" element={<Account />} />
          </Route>

          <Route path="/" element={<Navigate to="/app/home" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
