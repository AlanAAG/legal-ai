import React, { useState } from 'react';
import type { Operation } from '../../../types';
import { Copy, Share2, MessageCircle, Mail, ShieldCheck, ExternalLink, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  operation: Operation;
}

export const OperationShare: React.FC<Props> = ({ operation }) => {
  const [showToast, setShowToast] = useState(false);
  const [activeBanner, setActiveBanner] = useState<'whatsapp' | 'email' | null>(null);

  const shareUrl = `https://app.brokerdealroom.mx/expediente/${operation.id}/cliente`;

  const copyToClipboard = () => {
    // In a real browser, we'd use navigator.clipboard.writeText(shareUrl);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Main Sharing Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#1A2B3B] p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#C5A059]">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Compartir con el vendedor</h3>
              <p className="text-white/60 text-sm">Envíe este enlace seguro para comenzar la recolección.</p>
            </div>
          </div>
          
          <div className="mt-8 flex gap-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/80 select-all truncate">
              {shareUrl}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-[#C5A059] hover:bg-[#B38F4D] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveBanner('whatsapp')}
              className="flex items-center justify-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span className="text-sm font-bold text-slate-700">WhatsApp</span>
            </button>
            <button 
              onClick={() => setActiveBanner('email')}
              className="flex items-center justify-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <Mail className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              <span className="text-sm font-bold text-slate-700">Correo Electrónico</span>
            </button>
          </div>

          <AnimatePresence>
            {activeBanner && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3"
              >
                <InfoIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  Esta acción abriría {activeBanner === 'whatsapp' ? 'WhatsApp Web' : 'su cliente de correo'} con un mensaje preconfigurado que incluye el enlace de acceso seguro.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
                  Un entorno privado donde solo podrá ver y subir los documentos solicitados para su propiedad específica.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Sin Dictamen Legal
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  El sistema no genera opiniones jurídicas. Es una herramienta de organización y recolección técnica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed italic text-center">
          "Este portal tiene como único fin la organización y centralización de documentos para facilitar el proceso comercial. La revisión, validación y dictaminación legal de la documentación corresponde exclusivamente al notario público asignado o al abogado responsable de la operación."
        </p>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold">Enlace copiado al portapapeles</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
