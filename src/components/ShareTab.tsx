import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Mail, MessageSquare, ShieldCheck, Info } from 'lucide-react';
import type { PropertySale } from '../types/DocumentData';
// import { motion, AnimatePresence } from 'framer-motion';

export const ShareTab: React.FC<{ property: PropertySale }> = ({ property }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://brokerdealroom.mx/upload/${property.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-legal-gold/10 rounded-3xl mb-4 border border-legal-gold/20 shadow-xl shadow-legal-gold/5">
          <Share2 className="w-8 h-8 text-legal-gold" />
        </div>
        <h2 className="text-3xl font-black text-legal-navy font-serif">Compartir Acceso al Vendedor</h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          Envía este link seguro a <span className="text-legal-navy font-bold">{property.sellerName}</span> para que pueda subir sus documentos directamente desde su celular o computadora.
        </p>
      </div>

      <div className="glass rounded-3xl p-10 border border-slate-200/60 shadow-2xl shadow-legal-navy/5 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Acceso Seguro</label>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl group focus-within:ring-2 focus-within:ring-legal-gold/20 transition-all">
            <div className="flex-1 px-4 py-3 text-sm font-bold text-legal-navy truncate">
              {shareUrl}
            </div>
            <button 
              onClick={copyToClipboard}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                copied ? 'bg-emerald-500 text-white' : 'bg-legal-navy text-white hover:bg-slate-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Mail className="w-4 h-4 text-legal-gold" />
            <span>Enviar por Email</span>
          </button>
          <button className="flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/20 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/10 transition-all shadow-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-legal-navy/2">
          <ShieldCheck className="w-6 h-6 text-legal-gold" />
          <h3 className="text-sm font-black text-legal-navy uppercase tracking-wider">Seguridad Notarial</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">Los documentos se encriptan punto a punto y solo son visibles para el agente y el notario asignado.</p>
        </div>

        <div className="space-y-4 p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-legal-navy/2">
          <ExternalLink className="w-6 h-6 text-legal-gold" />
          <h3 className="text-sm font-black text-legal-navy uppercase tracking-wider">Vista del Vendedor</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">El vendedor verá una interfaz simplificada optimizada para dispositivos móviles con instrucciones claras.</p>
        </div>

        <div className="space-y-4 p-8 rounded-3xl bg-slate-900 text-white shadow-xl shadow-legal-navy/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Info className="w-32 h-32 text-legal-gold" />
          </div>
          <h3 className="text-sm font-black text-legal-gold uppercase tracking-wider">Tip para Agentes</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">Menciona al vendedor que subir las boletas de predial y agua primero agiliza el trámite ante el RPP.</p>
        </div>
      </div>
    </div>
  );
};
