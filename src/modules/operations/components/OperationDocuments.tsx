import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Operation, DocumentSlot, DocumentCategory, RedFlag } from '../../../types';
import { FileText, Upload, CheckCircle2, Loader2, ExternalLink, AlertCircle, AlertTriangle } from 'lucide-react';
import { documentService } from '../services/documentService';
import { analysisService } from '../services/analysisService';
import { useRealtimeSlot } from '../../../hooks/useRealtimeSlot';
import { toast } from 'sonner';

interface Props {
  operation: Operation;
  onRefresh: () => Promise<void>;
}

export const OperationDocuments: React.FC<Props> = ({ operation, onRefresh }) => {
  const [rowStates, setRowStates] = useState<Record<string, { loading: boolean; error: string | null }>>({});

  // Filtering logic based on operation context
  const filteredDocs = useMemo(() => {
    return operation.documentos.filter((doc: DocumentSlot) => {
      // Seller type filter
      if (doc.soloPersona && doc.soloPersona !== operation.vendedor.tipo) return false;

      // Conditional flags
      if (doc.category === 'condominio' && !operation.inmueble.esCondominio) return false;
      if (doc.category === 'construccion' && !operation.inmueble.tieneConstruccionOAmpliacion) return false;
      
      // Sucesión specific conditions
      if (doc.category === 'sucesion') {
        if (operation.inmueble.sucesionTipo === 'ninguna') return false;
        if (doc.condicion === 'sucesionTestamentaria' && operation.inmueble.sucesionTipo !== 'testamentaria') return false;
        if (doc.condicion === 'sucesionIntestamentaria' && operation.inmueble.sucesionTipo !== 'intestamentaria') return false;
      }

      return true;
    });
  }, [operation]);

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

  filteredDocs.forEach((doc: DocumentSlot) => {
    groups[doc.category].push(doc);
  });

  return Object.entries(groups).filter(([_, docs]) => docs.length > 0) as [DocumentCategory, DocumentSlot[]][];
}, [filteredDocs]);

  // Stats
  const totalRelevant = filteredDocs.length;
  const totalUploaded = filteredDocs.filter((d: DocumentSlot) => d.status === 'uploaded' || d.status === 'validated' || d.status === 'flagged' || d.status === 'analyzed').length;
  const remaining = totalRelevant - totalUploaded;
  const totalAlerts = filteredDocs.filter((d: DocumentSlot) => d.status === 'flagged' || d.status === 'analyzed').length;

  const handleUpload = async (docId: string, file: File) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      setRowStates(prev => ({ ...prev, [docId]: { loading: false, error: 'El archivo excede los 20MB.' } }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setRowStates(prev => ({ ...prev, [docId]: { loading: false, error: 'Solo se permiten PDF, JPG y PNG.' } }));
      return;
    }

    toast.promise(
      (async () => {
        setRowStates(prev => ({ ...prev, [docId]: { loading: true, error: null } }));
        const result = await documentService.uploadDocument(operation.id, docId, file);
        await analysisService.triggerAnalysis(docId, operation.id, result.storagePath);
      })(),
      {
        loading: 'Subiendo y analizando documento...',
        success: '¡Documento recibido! Iniciando auditoría legal...',
        error: (err) => {
          setRowStates(prev => ({ ...prev, [docId]: { loading: false, error: err.message || 'Error al procesar' } }));
          return err.message || 'Error al procesar';
        }
      }
    );
  };

  const handleViewDocument = async (storagePath: string) => {
    try {
      const url = await documentService.getSignedUrl(storagePath);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error getting signed URL:', err);
      alert('Error al abrir el documento.');
    }
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
            <h3 className="text-lg font-bold">Estado de documentación</h3>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-2xl font-black tracking-tight">{totalRelevant}</p>
            <p className="text-[10px] text-white/50 uppercase font-bold text-center">Relevantes</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-2xl font-black text-[#C5A059] tracking-tight">{remaining}</p>
            <p className="text-[10px] text-white/50 uppercase font-bold text-center">Faltantes</p>
          </div>
          {totalAlerts > 0 && (
            <>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <p className="text-2xl font-black text-red-400 tracking-tight">{totalAlerts}</p>
                <p className="text-[10px] text-white/50 uppercase font-bold text-center">Alertas</p>
              </div>
            </>
          )}
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
                  state={rowStates[doc.id] || { loading: false, error: null }}
                  onUpload={(file) => handleUpload(doc.id, file)} 
                  onView={() => doc.storagePath && handleViewDocument(doc.storagePath)}
                  onRefresh={onRefresh}
                  onLoadingEnd={() => setRowStates(prev => ({ ...prev, [doc.id]: { loading: false, error: null } }))}
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
  state: { loading: boolean; error: string | null };
  onUpload: (file: File) => void;
  onView: () => void;
  onRefresh: () => Promise<void>;
  onLoadingEnd: () => void;
}

const DocumentRow: React.FC<RowProps> = ({ doc, state, onUpload, onView, onRefresh, onLoadingEnd }) => {
  const isUploaded = doc.status === 'uploaded' || doc.status === 'validated' || doc.status === 'flagged' || doc.status === 'analyzed';
  const isAnalizando = state.loading || doc.analysis_status === 'analyzing';
  const isAnalyzed = doc.analysis_status === 'analyzed';
  const hasError = doc.analysis_status === 'error';
  
  const [flags, setFlags] = useState<RedFlag[]>([]);
  const [fetchingFlags, setFetchingFlags] = useState(false);
  const [showFlags, setShowFlags] = useState(false);

  useEffect(() => {
    if (isAnalyzed) {
      const fetchFlags = async () => {
        setFetchingFlags(true);
        try {
          const data = await documentService.getDetectedFlags(doc.id);
          setFlags(data);
        } catch (err) {
          console.error('Error fetching flags:', err);
        } finally {
          setFetchingFlags(false);
        }
      };
      fetchFlags();
    } else {
      setFlags([]);
    }
  }, [isAnalyzed, doc.status, doc.id]);

  const hasAlert = flags.length > 0 || doc.status === 'flagged';

  // Use Realtime Hook
  useRealtimeSlot(
    doc.id, 
    () => {
      onRefresh();
      onLoadingEnd();
    }, 
    isAnalizando
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine border color based on highest severity
  const maxSeverity = useMemo(() => {
    if (flags.length === 0) return null;
    if (flags.some(f => f.severity === 'critical')) return 'critical';
    if (flags.some(f => f.severity === 'high')) return 'high';
    if (flags.some(f => f.severity === 'medium')) return 'medium';
    return 'low';
  }, [flags]);

  const borderClass = useMemo(() => {
    if (!isUploaded || !hasAlert || !isAnalyzed) return 'border-slate-200';
    if (maxSeverity === 'critical') return 'border-red-400 bg-red-100/50';
    if (maxSeverity === 'high') return 'border-red-200 bg-red-50/30';
    if (maxSeverity === 'medium') return 'border-amber-200 bg-amber-50/30';
    return 'border-blue-200 bg-blue-50/30';
  }, [isUploaded, hasAlert, isAnalyzed, maxSeverity]);

  return (
    <div className={`group bg-white rounded-xl border p-5 hover:shadow-md transition-all ${borderClass}`}>
      <div className="flex items-center gap-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isUploaded ? (hasAlert ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600') : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
        }`}>
          {hasAlert ? <AlertTriangle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-sm font-bold text-slate-800 truncate tracking-tight">{doc.name}</h4>
            {doc.is_required && (
              <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                Obligatorio
              </span>
            )}
            
            {/* Status Badges */}
            {isAnalizando && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Analizando documento...
              </span>
            )}
            {isAnalyzed && !hasAlert && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Sin alertas
              </span>
            )}
            {hasError && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                <AlertCircle className="w-2.5 h-2.5" />
                Error en análisis
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{doc.description}</p>
          
          {isUploaded && (
            <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-slate-400">
              <span className="truncate max-w-[200px]">{doc.file_name}</span>
              <span>•</span>
              <span>Subido el {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          )}

          {state.error && (
            <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-red-500">
              <AlertCircle className="w-3 h-3" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Red Flags Action */}
          {hasAlert && isAnalyzed && (
            <button 
              onClick={() => setShowFlags(!showFlags)}
              disabled={fetchingFlags}
              className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
            >
              {fetchingFlags ? 'Cargando alertas...' : (showFlags ? 'Ocultar alertas' : `Ver ${flags.length} alertas detectadas`)}
              {!fetchingFlags && <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showFlags ? 'rotate-180' : ''}`} />}
            </button>
          )}

          {/* Collapsible Flag List */}
          {hasAlert && isAnalyzed && showFlags && !fetchingFlags && (
            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {flags.map((flag, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    (flag.severity === 'high' || flag.severity === 'critical')
                    ? 'bg-red-50/50 border-red-100 text-red-700' 
                    : flag.severity === 'medium'
                    ? 'bg-amber-50/50 border-amber-100 text-amber-700'
                    : 'bg-blue-50/50 border-blue-100 text-blue-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {(flag.severity === 'high' || flag.severity === 'critical') ? (
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black">!</div>
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold leading-relaxed">{flag.title}: {flag.description}</p>
                    <p className="text-[9px] mt-1 opacity-60 font-medium">Detectado el {new Date(flag.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isUploaded && (
            <button
              onClick={onView}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
              title="Ver documento"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalizando}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isUploaded
              ? 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
              : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isUploaded ? 'Reemplazar' : 'Subir archivo'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
