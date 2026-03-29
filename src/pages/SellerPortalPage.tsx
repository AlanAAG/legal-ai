import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { sellerService } from '../modules/operations/services/sellerService';
import { documentService } from '../modules/operations/services/documentService';
import type { Operation, DocumentSlot } from '../types';
import { 
  Loader2, 
  CheckCircle2, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Home,
  AlertCircle
} from 'lucide-react';

export const SellerPortalPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<string, { loading: boolean; success: boolean; error: string | null }>>({});

  useEffect(() => {
    if (shareToken) {
      fetchOperation();
    }
  }, [shareToken]);

  const fetchOperation = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getOperationByToken(shareToken!);
      if (data) {
        setOperation(data);
      } else {
        setError('El enlace es inválido o ha expirado.');
      }
    } catch (err) {
      console.error('Error fetching operation:', err);
      setError('Error al cargar la información. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (slotId: string, file: File) => {
    // Basic validation
    if (file.size > 20 * 1024 * 1024) {
      setUploadStates(prev => ({ ...prev, [slotId]: { loading: false, success: false, error: 'El archivo excede los 20MB.' } }));
      return;
    }

    try {
      setUploadStates(prev => ({ ...prev, [slotId]: { loading: true, success: false, error: null } }));
      await documentService.uploadSellerDocument(operation!.id, slotId, file);
      
      setUploadStates(prev => ({ ...prev, [slotId]: { loading: false, success: true, error: null } }));
      
      // Refresh to show "Subido" status
      setTimeout(fetchOperation, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStates(prev => ({ ...prev, [slotId]: { loading: false, success: false, error: 'Error al subir. Intenta de nuevo.' } }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-slate-100 shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-[#001529] mb-2">Enlace no válido</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {error || 'No pudimos encontrar la información de esta operación.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-[#001529] text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Portal de Documentación</h1>
              <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Legal AI • Acceso Seguro</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold leading-tight">
              Hola, {operation.vendedor.nombreCompleto.split(' ')[0]}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
              Su agente <span className="text-white font-bold">{operation.agente.nombre}</span> le solicita los siguientes documentos para continuar con el proceso de venta de la propiedad en:
              <br />
              <span className="text-white font-bold inline-flex items-center gap-1.5 mt-1">
                <Home className="w-3.5 h-3.5 text-[#C5A059]" />
                {operation.inmueble.direccion.calle} {operation.inmueble.direccion.numeroExterior}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Section */}
      <div className="max-w-3xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#001529]">
              Documentos requeridos
            </h3>
          </div>

          <div className="divide-y divide-slate-50">
            {operation.documentos.map((doc) => (
              <SellerDocumentRow 
                key={doc.id} 
                doc={doc} 
                state={uploadStates[doc.id] || { loading: false, success: false, error: null }}
                onUpload={(file) => handleUpload(doc.id, file)}
              />
            ))}
          </div>

          <div className="p-8 bg-slate-50/80">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 uppercase block mb-1">Privacidad y Seguridad:</span>
                Sus documentos son confidenciales y serán utilizados únicamente para el trámite notarial de su propiedad. Contamos con altos estándares de encriptación y protección de datos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer for mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 text-center md:hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Broker Deal Room • Propulsado por Legal AI
        </p>
      </div>
    </div>
  );
};

interface RowProps {
  doc: DocumentSlot;
  state: { loading: boolean; success: boolean; error: string | null };
  onUpload: (file: File) => void;
}

const SellerDocumentRow: React.FC<RowProps> = ({ doc, state, onUpload }) => {
  const isUploaded = doc.status === 'uploaded' || doc.status === 'validated' || doc.status === 'flagged' || state.success;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-8 group hover:bg-slate-50/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
          isUploaded ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-300'
        }`}>
          {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">{doc.name}</h4>
            {doc.is_required && (
              <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                Obligatorio
              </span>
            )}
            {isUploaded && (
              <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                Recibido
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{doc.description}</p>
          
          {state.error && (
            <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {state.error}
            </p>
          )}
        </div>

        <div className="shrink-0">
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
            disabled={state.loading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isUploaded
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : 'bg-[#C5A059] text-white hover:bg-[#B38E46] shadow-lg shadow-[#C5A059]/20'
            } disabled:opacity-50`}
          >
            {state.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {isUploaded ? 'Actualizar' : 'Subir archivo'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
