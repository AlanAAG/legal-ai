import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { OperationDashboard } from './modules/operations/pages/OperationDashboard';
import { SellerPortalPage } from './pages/SellerPortalPage';
import OperationsListPage from './pages/OperationsListPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Iniciando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" expand={false} richColors />
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans antialiased selection:bg-[#C5A059]/20">
        {user && <Navbar />}
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/expediente/:shareToken" element={<SellerPortalPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/operaciones" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/operaciones" element={
              <ProtectedRoute>
                <OperationsListPage />
              </ProtectedRoute>
            } />
            
            <Route path="/operaciones/:operationId" element={
              <ProtectedRoute>
                <OperationDashboard />
              </ProtectedRoute>
            } />

            <Route path="/perfil" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/operaciones" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
