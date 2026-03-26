import React, { useState } from 'react';
import type { Operation } from '../../../types';
import { 
  Copy, 
  Share2, 
  MessageCircle, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

interface Props {
  operation: Operation;
}

export const OperationShare: React.FC<Props> = ({ operation }) => {
  const [copied, setCopied] = useState(false);
  
  // Real URL logic using the window origin and the operation's share token
  const shareUrl = `${window.location.origin}/expediente/${operation.shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hola ${operation.vendedor.nombreCompleto.split(' ')[0]}, soy ${operation.agente.nombre}. Te comparto el enlace seguro para subir la documentación de tu propiedad: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* 1. Main Share Card */}
      <div className="bg-white rounded-[32px] p-10 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 border border-slate-100" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#C5A059]">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#001529] tracking-tight">Portal del Vendedor</h3>
            <p className="text-slate-400 font-medium text-sm">Comparte este enlace con tu cliente para recibir documentos.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <ExternalLink className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              readOnly
              value={shareUrl}
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 outline-none group-hover:border-slate-200 transition-all truncate"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  copied ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-[#001529] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <button 
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-200 active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            Compartir por WhatsApp
          </button>
        </div>

        {/* Explanation Section */}
        <div className="pt-8 border-t border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            <h4 className="font-bold text-slate-800">¿Qué verá el vendedor al acceder?</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Portal Seguro
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Un entorno privado donde solo podrá subir los documentos solicitados para su propiedad específica. No se requiere registro.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Confidencialidad
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Los documentos se almacenan de forma segura y solo son accesibles para el agente y el equipo legal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200">
        <p className="text-[11px] text-slate-500 leading-relaxed italic text-center">
          "Broker Deal Room utiliza el motor de inteligencia artificial de Legal AI para la organización documental. La validación jurídica final es responsabilidad del profesional a cargo."
        </p>
      </div>
    </div>
  );
};
