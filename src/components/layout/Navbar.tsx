import React from 'react';
import { Layout, User, Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { agent, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#001529] border-b border-white/10 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#9C7E46] rounded-lg flex items-center justify-center shadow-lg">
            <Layout className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight leading-none">Broker Deal Room</h1>
            <p className="text-[#C5A059] text-[10px] uppercase tracking-[0.2em] font-medium mt-1">Phase 1 • Gestión Documental</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-white/60 hover:text-[#C5A059] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C5A059] rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-white/10"></div>

        <Link to="/perfil" className="flex items-center gap-3 group cursor-pointer text-left">
          <div className="hidden sm:block text-right">
            <p className="text-white text-sm font-medium group-hover:text-[#C5A059] transition-colors">
              {agent?.nombre || 'Perfil no encontrado'}
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">
              {agent ? (agent.esAMPI ? 'Agente AMPI' : 'Agente') : 'Error de Sesión'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#C5A059] transition-all overflow-hidden bg-gradient-to-br from-[#001529] to-[#002140]">
            <User className="text-white/60 w-5 h-5 group-hover:text-[#C5A059]" />
          </div>
        </Link>
        
        <div className="h-8 w-[1px] bg-white/10 ml-2"></div>

        <button 
          onClick={() => signOut()}
          className="p-2 text-white/40 hover:text-red-400 transition-colors group relative"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
