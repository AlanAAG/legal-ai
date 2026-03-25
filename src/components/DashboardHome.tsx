import React from 'react';
import { User, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { PropertySale } from '../types/DocumentData';
import { motion } from 'framer-motion';

export const DashboardHome: React.FC<{ property: PropertySale }> = ({ property }) => {
  return (
    <div className="space-y-8">
      {/* Property Overview Card */}
      <div className="glass rounded-3xl overflow-hidden border border-slate-200/50 shadow-2xl shadow-legal-navy/5">
        <div className="bg-legal-navy p-8 text-white relative h-48 overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-legal-gold/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/5 rounded-full -mb-16 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-legal-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
              <MapPin className="w-3 h-3" />
              <span>Propiedad en Venta</span>
            </div>
            <h2 className="text-3xl font-bold font-serif max-w-2xl leading-tight">{property.address}</h2>
          </div>
        </div>
        
        <div className="px-8 py-10 bg-white grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2 group">
            <div className="flex items-center space-x-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider group-hover:text-legal-gold transition-colors">
              <User className="w-3 h-3" />
              <span>Vendedor</span>
            </div>
            <p className="text-lg font-bold text-legal-navy">{property.sellerName}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
              {property.sellerType}
            </span>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Progreso de Expediente</span>
                <p className="text-4xl font-black text-legal-navy">{property.progress}<span className="text-xl text-legal-gold font-bold ml-0.5">%</span></p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Documentos Recopilados</span>
                <p className="text-lg font-bold text-legal-navy">
                  {property.categories.reduce((acc, cat) => acc + cat.documents.filter(d => d.status === 'Cargado').length, 0)} / {property.categories.reduce((acc, cat) => acc + cat.documents.length, 0)}
                </p>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${property.progress}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-legal-navy via-slate-800 to-legal-gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats / Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-legal-navy/2 flex items-start space-x-4 transition-all"
        >
          <div className="bg-emerald-50 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sin Pendientes</p>
            <p className="text-sm text-slate-600 font-medium">Revisión de propiedad completada con el notario.</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-legal-navy/2 flex items-start space-x-4 transition-all"
        >
          <div className="bg-amber-50 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">3 Días Restantes</p>
            <p className="text-sm text-slate-600 font-medium">Fecha límite para entrega de boletas predial y agua.</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-legal-gold/5 p-6 rounded-2xl border border-legal-gold/20 shadow-lg shadow-legal-gold/5 flex items-start space-x-4 transition-all"
        >
          <div className="bg-legal-gold/20 p-3 rounded-xl">
            <ArrowRight className="w-6 h-6 text-legal-gold" />
          </div>
          <div>
            <p className="text-xs font-bold text-legal-gold uppercase tracking-widest mb-1">Siguiente Paso</p>
            <p className="text-sm text-legal-navy font-bold">Solicitar firmas del vendedor física para el anexo 1.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
