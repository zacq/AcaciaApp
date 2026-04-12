/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Flock from './pages/Flock';
import AnimalProfile from './pages/AnimalProfile';
import Notes from './pages/Notes';
import Reporting from './pages/Reporting';
import MedicineCabinet from './pages/MedicineCabinet';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="home" element={<Home />} />
            <Route path="flock" element={<Flock />} />
            <Route path="flock/animals/:id" element={<AnimalProfile />} />
            <Route path="notes" element={<Notes />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="medicine-cabinet" element={<MedicineCabinet />} />
            <Route index element={<Navigate to="home" />} />
          </Route>
          <Route path="/" element={<Navigate to="/app/home" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

