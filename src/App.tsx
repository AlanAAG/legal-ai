import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { OperationDashboard } from './modules/operations/pages/OperationDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans antialiased selection:bg-[#C5A059]/20">
        <Navbar />
        
        <main>
          <Routes>
            {/* Redirect / to operations/1 for Phase 1 */}
            <Route path="/" element={<Navigate to="/operaciones/1" replace />} />
            
            {/* Main Operation Dashboard */}
            <Route path="/operaciones/:operationId" element={<OperationDashboard />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/operaciones/1" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
