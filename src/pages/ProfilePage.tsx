import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../modules/operations/services/agentService';
import { User, Phone, Building, Star, Save, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { agent, user, loading: authLoading, signOut, refreshAgent } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    agencia: '',
    esAMPI: false
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        nombre: agent.nombre,
        telefono: agent.telefono,
        agencia: agent.agencia,
        esAMPI: agent.esAMPI
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    toast.promise(Promise.all([
      agentService.updateProfile(user.id, formData),
      refreshAgent()
    ]), {
      loading: 'Actualizando perfil...',
      success: () => {
        setIsEditing(false);
        return '¡Perfil actualizado!';
      },
      error: (err) => err.message || 'Error al actualizar',
      finally: () => setIsLoading(false)
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (user && !agent) {
    // If user exists but agent profile is missing, initialize email and allow "Edit" mode to create it
    if (formData.nombre === '' && user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }

    return (
      <div className="pt-24 pb-12 min-h-screen px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full"
        >
          <div className="bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 space-y-8">
            <div className="w-20 h-20 bg-[#C5A059]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#C5A059]/20">
              <User className="w-10 h-10 text-[#C5A059]" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#001529]">Completa tu Perfil</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Necesitamos unos últimos detalles para activar tu cuenta de agente y empezar a gestionar expedientes.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Nombre Completo</label>
                <input 
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-140 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Agencia / Inmobiliaria</label>
                <input 
                  type="text"
                  required
                  value={formData.agencia}
                  onChange={(e) => setFormData({...formData, agencia: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-140 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all"
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#001529] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-[#002140] transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar y Activar Perfil
              </button>
            </form>

            <button 
              onClick={() => signOut()}
              className="w-full text-slate-400 text-xs font-bold hover:text-red-500 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || !agent) return null;

  return (
    <div className="pt-24 pb-12 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#001529] tracking-tight">Mi Perfil Profesional</h1>
          <p className="text-slate-500 mt-2">Gestiona tu información pública y credenciales de agente.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card: Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C5A059] to-[#9C7E46] p-1 mb-6 shadow-xl">
                <div className="w-full h-full rounded-full bg-[#001529] flex items-center justify-center overflow-hidden border-2 border-white/10">
                  <User className="text-white w-10 h-10" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#001529]">{agent.nombre}</h2>
              <p className="text-slate-400 text-sm mb-6">{agent.email}</p>
              
              <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center justify-between text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Estado</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${agent.esAMPI ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {agent.esAMPI ? 'Socio AMPI' : 'Agente'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => signOut()}
                className="w-full mt-8 py-3 rounded-2xl text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>

            <div className="bg-[#001529] rounded-[32px] p-8 shadow-2xl text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059] opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              <ShieldCheck className="w-8 h-8 text-[#C5A059] mb-4" />
              <h3 className="font-bold text-lg mb-2">Seguridad Verificada</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Tus datos están protegidos con encriptación de nivel bancario y políticas RLS avanzadas.
              </p>
            </div>
          </div>

          {/* Card: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-black text-slate-400">Información General</span>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-[#C5A059] hover:underline"
                >
                  {isEditing ? 'Cancelar' : 'Editar Información'}
                </button>
              </div>

              <div className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="text"
                          disabled={!isEditing}
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Teléfono Móvil</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="tel"
                          disabled={!isEditing}
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all disabled:opacity-60"
                          placeholder="55 0000 0000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agencia */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Agencia / Inmobiliaria</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="text"
                        disabled={!isEditing}
                        value={formData.agencia}
                        onChange={(e) => setFormData({...formData, agencia: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all disabled:opacity-60"
                        placeholder="Nombre de tu agencia"
                      />
                    </div>
                  </div>

                  {/* Socio AMPI */}
                  <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className={`p-3 rounded-2xl ${formData.esAMPI ? 'bg-amber-500' : 'bg-slate-200'} transition-colors`}>
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#001529]">Membresía AMPI</h4>
                      <p className="text-[10px] text-slate-500">¿Eres socio activo de la Asociación Mexicana de Profesionales Inmobiliarios?</p>
                    </div>
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setFormData({...formData, esAMPI: !formData.esAMPI})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 ${formData.esAMPI ? 'bg-[#C5A059]' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.esAMPI ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#001529] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-[#002140] transition-all"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Actualizar Perfil
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
