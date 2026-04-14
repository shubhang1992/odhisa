import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardShell from './dashboard/DashboardShell';

function ProtectedDashboard() {
  const { isAuthenticated, login } = useAuth();

  // Demo: this project ships only the Distributor Admin dashboard, so the first
  // visit auto-signs the visitor in as a distributor.
  useEffect(() => {
    if (!isAuthenticated) {
      login({ role: 'distributor', phone: '+91 98765 43210', name: 'Distributor Admin' });
    }
  }, [isAuthenticated, login]);

  if (!isAuthenticated) return null;
  return (
    <ErrorBoundary>
      <DashboardShell />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard/*" element={<ProtectedDashboard />} />
    </Routes>
  );
}
