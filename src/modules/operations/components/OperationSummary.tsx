import React from 'react';
import type { Operation } from '../../../types';
import { getPropertyTypeLabel, getPropertyUseLabel, getSucesionLabel, calculateProgress } from '../utils';
import { Home, User, BarChart3, MapPin, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  operation: Operation;
  onViewDocuments: () => void;
}

export const OperationSummary: React.FC<Props> = ({ operation, onViewDocuments }) => {
  const { totalRequired, totalUploaded, percentage } = calculateProgress(operation);
  const inmueble = operation.inmueble;
  const vendedor = operation.vendedor;

  // Aggregate Red Flags
  const totalAlerts = operation.documentos.filter(d => d.status === 'flagged' || d.status === 'analyzed').length;
  // Note: We don't distinguish counts for summary here without extra queries, 
  // but we show the overall alert status.
  const advertencias = 0; // Simplified for summary
  const bloqueantes = totalAlerts;

  return (
    <div className="space-y-8">
      {/* 1. Red Flag Summary Banner */}
      <div className={`rounded-2xl border p-6 flex items-center justify-between ${
        totalAlerts > 0 
        ? 'bg-amber-50 border-amber-200 text-amber-900' 
        : 'bg-green-50 border-green-200 text-green-900'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            totalAlerts > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
          }`}>
            {totalAlerts > 0 ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">
              Resultados del análisis automático
            </h3>
            <p className="text-sm font-bold opacity-80">
              {totalAlerts === 0 
                ? '✅ Sin alertas detectadas en los documentos analizados.'
                : `Se detectaron ${bloqueantes} bloqueos y ${advertencias} advertencias que requieren tu atención.`
              }
            </p>
          </div>
        </div>
        
        {totalAlerts > 0 && (
          <button 
            onClick={onViewDocuments}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm"
          >
            Ver documentos con alertas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Data Cards */}
        <div className="space-y-8">
          {/* Section 1: Datos del inmueble */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Datos del inmueble</h3>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Tipo</p>
                <p className="text-sm font-semibold text-slate-700">{getPropertyTypeLabel(inmueble.tipo)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Uso</p>
                <p className="text-sm font-semibold text-slate-700">{getPropertyUseLabel(inmueble.uso)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Dirección</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-300 mt-0.5" />
                  <p className="text-sm font-semibold text-slate-700 leading-tight">
                    {inmueble.direccion.calle} {inmueble.direccion.numeroExterior}, {inmueble.direccion.colonia}, {inmueble.direccion.alcaldia}, CP {inmueble.direccion.codigoPostal}, {inmueble.direccion.estado}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              <Badge label="Condominio" active={inmueble.esCondominio} />
              <Badge label="Construcción / Ampliación" active={inmueble.tieneConstruccionOAmpliacion} />
              <Badge label={`Sucesión: ${getSucesionLabel(inmueble.sucesionTipo)}`} active={inmueble.sucesionTipo !== 'ninguna'} />
            </div>
          </div>

          {/* Section 2: Datos del vendedor */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Datos del vendedor</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Nombre completo</p>
                <p className="text-sm font-semibold text-slate-700">{vendedor.nombreCompleto}</p>
                <p className="text-[10px] font-bold text-[#C5A059] uppercase mt-1">
                  {vendedor.tipo === 'fisica' ? 'Persona Física' : 'Persona Moral'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Teléfono</p>
                    <p className="text-xs font-semibold text-slate-600">{vendedor.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Email</p>
                    <p className="text-xs font-semibold text-slate-600 truncate">{vendedor.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress Card */}
        <div className="space-y-8">
          {/* Section 3: Progreso del expediente */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8 sticky top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Progreso del expediente</h3>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm font-medium text-slate-600">
                <span className="text-slate-900 font-bold">{totalUploaded}</span> de <span className="text-slate-900 font-bold">{totalRequired}</span> documentos requeridos subidos.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-start gap-3">
                {percentage === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {percentage === 100 ? 'Expediente completo' : 'Expediente en curso'}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {percentage === 100 
                      ? 'Todos los documentos obligatorios han sido cargados exitosamente.' 
                      : 'Aún faltan documentos obligatorios para completar el registro de la propiedad.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Legal Disclaimer */}
      <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200">
        <div className="flex gap-3">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            <span className="font-bold uppercase text-slate-700">Aviso Legal:</span> Este análisis es preliminar y se basa únicamente en los documentos subidos mediante procesamiento automático de lenguaje. Los resultados presentados son de carácter informativo y no constituyen una opinión legal vinculante ni sustituyen la verificación física y formal que debe realizar el notario público asignado a la operación.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper Component: Badge
const Badge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
    active 
    ? 'bg-slate-900 text-white border-slate-900' 
    : 'bg-slate-50 text-slate-300 border-slate-100'
  }`}>
    {label}
  </span>
);
