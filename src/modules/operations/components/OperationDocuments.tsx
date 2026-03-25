import React, { useState, useMemo } from 'react';
import type { Operation, DocumentSlot, DocumentCategory } from '../../../types';
import { FileText, Upload, CheckCircle2 } from 'lucide-react';

interface Props {
  operation: Operation;
}

export const OperationDocuments: React.FC<Props> = ({ operation }) => {
  // Local state to simulate "uploads" without a backend
  const [documents, setDocuments] = useState<DocumentSlot[]>(operation.documentos);

  // Filtering logic based on operation context
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Seller type filter
      if (doc.soloPersona && doc.soloPersona !== operation.vendedor.tipo) return false;

      // Conditional flags
      if (doc.categoria === 'condominio' && !operation.inmueble.esCondominio) return false;
      if (doc.categoria === 'construccion' && !operation.inmueble.tieneConstruccionOAmpliacion) return false;
      
      // Sucesión specific conditions
      if (doc.categoria === 'sucesion') {
        if (operation.inmueble.sucesionTipo === 'ninguna') return false;
        if (doc.condicion === 'sucesionTestamentaria' && operation.inmueble.sucesionTipo !== 'testamentaria') return false;
        if (doc.condicion === 'sucesionIntestamentaria' && operation.inmueble.sucesionTipo !== 'intestamentaria') return false;
      }

      return true;
    });
  }, [documents, operation]);

  // Grouping logic
  const sections = useMemo(() => {
    const groups: Record<DocumentCategory, DocumentSlot[]> = {
      propiedad: [],
      condominio: [],
      construccion: [],
      sucesion: [],
      vendedorFisica: [],
      vendedorMoral: []
    };

    filteredDocs.forEach(doc => {
      groups[doc.categoria].push(doc);
    });

    return Object.entries(groups).filter(([_, docs]) => docs.length > 0);
  }, [filteredDocs]);

  // Stats
  const totalRelevant = filteredDocs.length;
  const totalUploaded = filteredDocs.filter(d => d.estado === 'subido').length;
  const remaining = totalRelevant - totalUploaded;

  // Mock upload handler
  const handleUpload = (docId: string) => {
    const fileName = `documento_${Math.random().toString(36).substring(7)}.pdf`;
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
      ? { 
          ...doc, 
          estado: 'subido', 
          archivoNombre: fileName, 
          fechaSubida: new Date().toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) 
        } 
      : doc
    ));
  };

  const getSectionTitle = (cat: string) => {
    const titles: Record<string, string> = {
      propiedad: 'Documentos del inmueble',
      condominio: 'Condominio',
      construccion: 'Construcción y ampliaciones',
      sucesion: 'Sucesión',
      vendedorFisica: 'Vendedor – Persona física',
      vendedorMoral: 'Vendedor – Persona moral'
    };
    return titles[cat] || cat;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Summary Header */}
      <div className="bg-[#1A2B3B] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
            <BarChartIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Resumen del checklist</p>
            <h3 className="text-lg font-bold">Documentos relevantes para esta operación</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tracking-tight">{totalRelevant}</p>
          <p className="text-[10px] text-white/50 uppercase font-bold">Total necesarios</p>
        </div>
        <div className="w-px h-10 bg-white/10 mx-6" />
        <div className="text-right">
          <p className="text-2xl font-black text-[#C5A059] tracking-tight">{remaining}</p>
          <p className="text-[10px] text-white/50 uppercase font-bold">Faltan por subir</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {sections.map(([category, docs]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                {getSectionTitle(category)}
              </h2>
              <div className="flex-1 h-px bg-slate-100 ml-4" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {docs.map(doc => (
                <DocumentRow 
                  key={doc.id} 
                  doc={doc} 
                  onUpload={() => handleUpload(doc.id)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Subcomponent: DocumentRow
interface RowProps {
  doc: DocumentSlot;
  onUpload: () => void;
}

const DocumentRow: React.FC<RowProps> = ({ doc, onUpload }) => {
  const isUploaded = doc.estado === 'subido';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all hover:shadow-md flex items-center gap-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        isUploaded ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
      }`}>
        <FileText className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-sm font-bold text-slate-800 truncate tracking-tight">{doc.nombre}</h4>
          {doc.esObligatorio && (
            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              Obligatorio
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{doc.descripcion}</p>
        
        {isUploaded && (
          <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-slate-400 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>{doc.archivoNombre}</span>
            <span>•</span>
            <span>Subido el {doc.fechaSubida}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          isUploaded 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-slate-50 text-slate-400 border-slate-100'
        }`}>
          {isUploaded ? 'Subido' : 'No subido'}
        </div>

        <button
          onClick={onUpload}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            isUploaded
            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          {isUploaded ? 'Reemplazar' : 'Subir archivo'}
        </button>
      </div>
    </div>
  );
};

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
