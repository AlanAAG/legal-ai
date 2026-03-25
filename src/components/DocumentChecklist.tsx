import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Upload, Trash2, MoreVertical, Search, Filter } from 'lucide-react';
import type { PropertySale, DocumentStatus } from '../types/DocumentData';
import { motion } from 'framer-motion';

interface Props {
  property: PropertySale;
  onUpdateStatus: (categoryId: string, docId: string, status: DocumentStatus) => void;
}

const statusColors: Record<DocumentStatus, string> = {
  'Pendiente': 'bg-slate-100 text-slate-500 border-slate-200',
  'Cargado': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Rechazado': 'bg-rose-50 text-rose-700 border-rose-100',
  'En Revisión': 'bg-blue-50 text-blue-700 border-blue-100',
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  'Pendiente': <Clock className="w-3.5 h-3.5" />,
  'Cargado': <CheckCircle className="w-3.5 h-3.5" />,
  'Rechazado': <AlertCircle className="w-3.5 h-3.5" />,
  'En Revisión': <Upload className="w-3.5 h-3.5" />,
};

export const DocumentChecklist: React.FC<Props> = ({ property, onUpdateStatus }) => {
  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar documento..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-gold/20 focus:border-legal-gold transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1 hidden md:block"></div>
          {['Todo', 'Pendiente', 'Cargado', 'En Revisión'].map((filter) => (
            <button key={filter} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === 'Todo' ? 'bg-legal-navy text-white' : 'text-slate-50 text-slate-500 hover:bg-slate-100'}`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {property.categories.map((category) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 px-2">
              <div className="w-1.5 h-6 bg-legal-gold rounded-full"></div>
              <h3 className="text-sm font-black text-legal-navy uppercase tracking-widest">{category.title}</h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {category.documents.filter(d => d.status === 'Cargado').length}/{category.documents.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-lg shadow-legal-navy/[0.02] hover:shadow-legal-navy/[0.04] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusColors[doc.status]}`}>
                      {statusIcons[doc.status]}
                      <span>{doc.status}</span>
                    </div>
                    <button className="text-slate-300 hover:text-legal-navy transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-bold text-legal-navy leading-snug min-h-[40px]">{doc.name}</h4>
                    {doc.updatedAt && (
                      <p className="text-[10px] text-slate-400 font-medium">Actualizado: {doc.updatedAt}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {doc.status === 'Pendiente' ? (
                      <button 
                        onClick={() => onUpdateStatus(category.id, doc.id, 'Cargado')}
                        className="flex-1 flex items-center justify-center space-x-2 bg-legal-navy text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all border border-legal-navy"
                      >
                        <Upload className="w-3.5 h-3.5 text-legal-gold" />
                        <span>Subir Archivo</span>
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 flex items-center justify-center space-x-2 bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(category.id, doc.id, 'Pendiente')}
                          className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
