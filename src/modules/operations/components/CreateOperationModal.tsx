import React, { useState } from 'react';
import { 
  X, 
  User, 
  Home, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreateOperationInput } from '../services/operationService';
import type { SellerType, PropertyType, PropertyUsage, SuccessionType } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateOperationInput) => void;
  isSubmitting?: boolean;
}

const CreateOperationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateOperationInput>({
    seller: {
      nombreCompleto: '',
      tipo: 'fisica',
      telefono: '',
      email: ''
    },
    property: {
      tipo: 'casa',
      uso: 'habitacional',
      calle: '',
      numeroExterior: '',
      colonia: '',
      alcaldia: '',
      codigoPostal: '',
      estado: 'CDMX',
      esCondominio: false,
      tieneConstruccionOAmpliacion: false,
      sucesionTipo: 'ninguna'
    }
  });

  if (!isOpen) return null;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.seller.nombreCompleto.trim()) newErrors.push('nombreCompleto');
      if (!formData.seller.telefono.trim()) newErrors.push('telefono');
      if (!formData.seller.email.trim()) newErrors.push('email');
    } else if (currentStep === 2) {
      if (!formData.property.calle.trim()) newErrors.push('calle');
      if (!formData.property.numeroExterior.trim()) newErrors.push('numeroExterior');
      if (!formData.property.colonia.trim()) newErrors.push('colonia');
      if (!formData.property.alcaldia.trim()) newErrors.push('alcaldia');
      if (!formData.property.codigoPostal.trim()) newErrors.push('codigoPostal');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setErrors([]);
    setStep(s => s - 1);
  };

  const steps = [
    { title: 'Vendedor', icon: User },
    { title: 'Inmueble', icon: Home },
    { title: 'Confirmar', icon: CheckCircle2 }
  ];

  const hasError = (field: string) => errors.includes(field);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#001529]">Nueva Operación</h2>
            <p className="text-slate-400 text-sm">Registro de expediente inmobiliario</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pb-8 pt-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
            {steps.map((Item, idx) => {
              const Icon = Item.icon;
              const isActive = step === idx + 1;
              const isPast = step > idx + 1;
              return (
                <div key={idx} className="flex flex-col items-center group">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/30 scale-110' : ''}
                    ${isPast ? 'bg-[#001529] text-white' : 'bg-white border-2 border-slate-100 text-slate-300'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-black mt-2 ${isActive ? 'text-[#C5A059]' : 'text-slate-400'}`}>
                    {Item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 bg-slate-50/50 min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={formData.seller.nombreCompleto}
                      onChange={e => setFormData({ ...formData, seller: { ...formData.seller, nombreCompleto: e.target.value } })}
                      className={`w-full px-4 py-3 rounded-2xl border ${hasError('nombreCompleto') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 outline-none transition-all`}
                      placeholder="Juan Pérez García"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Tipo de Persona</label>
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
                      {(['fisica', 'moral'] as SellerType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setFormData({ ...formData, seller: { ...formData.seller, tipo: t } })}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formData.seller.tipo === t ? 'bg-[#001529] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {t === 'fisica' ? 'Persona Física' : 'Persona Moral'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Teléfono</label>
                    <input 
                      type="tel" 
                      value={formData.seller.telefono}
                      onChange={e => setFormData({ ...formData, seller: { ...formData.seller, telefono: e.target.value } })}
                      className={`w-full px-4 py-3 rounded-2xl border ${hasError('telefono') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 outline-none transition-all`}
                      placeholder="55 0000 0000"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.seller.email}
                      onChange={e => setFormData({ ...formData, seller: { ...formData.seller, email: e.target.value } })}
                      className={`w-full px-4 py-3 rounded-2xl border ${hasError('email') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 outline-none transition-all`}
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Tipo de Inmueble</label>
                    <select 
                      value={formData.property.tipo}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, tipo: e.target.value as PropertyType } })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#C5A059] outline-none appearance-none bg-white"
                    >
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="terreno">Terreno</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Uso</label>
                    <select 
                      value={formData.property.uso}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, uso: e.target.value as PropertyUsage } })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#C5A059] outline-none appearance-none bg-white"
                    >
                      <option value="habitacional">Habitacional</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Calle y Número</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Calle"
                        value={formData.property.calle}
                        onChange={e => setFormData({ ...formData, property: { ...formData.property, calle: e.target.value } })}
                        className={`flex-[3] px-4 py-3 rounded-2xl border ${hasError('calle') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] outline-none`}
                      />
                      <input 
                        type="text" 
                        placeholder="No."
                        value={formData.property.numeroExterior}
                        onChange={e => setFormData({ ...formData, property: { ...formData.property, numeroExterior: e.target.value } })}
                        className={`flex-1 px-4 py-3 rounded-2xl border ${hasError('numeroExterior') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] outline-none text-center`}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Colonia"
                      value={formData.property.colonia}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, colonia: e.target.value } })}
                      className={`px-4 py-3 rounded-2xl border ${hasError('colonia') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] outline-none`}
                    />
                    <input 
                      type="text" 
                      placeholder="Alcaldía"
                      value={formData.property.alcaldia}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, alcaldia: e.target.value } })}
                      className={`px-4 py-3 rounded-2xl border ${hasError('alcaldia') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] outline-none`}
                    />
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Código Postal"
                      value={formData.property.codigoPostal}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, codigoPostal: e.target.value } })}
                      className={`px-4 py-3 rounded-2xl border ${hasError('codigoPostal') ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-[#C5A059] outline-none`}
                    />
                    <select 
                      value={formData.property.estado}
                      onChange={e => setFormData({ ...formData, property: { ...formData.property, estado: e.target.value } })}
                      className="px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#C5A059] outline-none bg-white"
                    >
                      <option value="CDMX">CDMX</option>
                      <option value="Edomex">Edomex</option>
                      <option value="Jalisco">Jalisco</option>
                      <option value="Nuevo León">Nuevo León</option>
                      <option value="Querétaro">Querétaro</option>
                    </select>
                  </div>

                  <div className="col-span-2 bg-white p-6 rounded-[24px] border border-slate-100 space-y-4 shadow-sm">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400">Condiciones Específicas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <input 
                          type="checkbox" 
                          checked={formData.property.esCondominio}
                          onChange={e => setFormData({ ...formData, property: { ...formData.property, esCondominio: e.target.checked } })}
                          className="w-5 h-5 rounded-md border-slate-200 text-[#C5A059] focus:ring-[#C5A059]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">Régimen Condominal</span>
                          <span className="text-[10px] text-slate-400">¿Se encuentra en un desarrollo?</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <input 
                          type="checkbox" 
                          checked={formData.property.tieneConstruccionOAmpliacion}
                          onChange={e => setFormData({ ...formData, property: { ...formData.property, tieneConstruccionOAmpliacion: e.target.checked } })}
                          className="w-5 h-5 rounded-md border-slate-200 text-[#C5A059] focus:ring-[#C5A059]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">Ampliación / Obra</span>
                          <span className="text-[10px] text-slate-400">¿Tiene construcción reciente?</span>
                        </div>
                      </label>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50">
                      <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-3">Sucesión</label>
                      <div className="flex flex-wrap gap-2">
                        {(['ninguna', 'testamentaria', 'intestamentaria'] as SuccessionType[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setFormData({ ...formData, property: { ...formData.property, sucesionTipo: s } })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formData.property.sucesionTipo === s ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                          >
                            {s === 'ninguna' ? 'Ninguna' : s === 'testamentaria' ? 'Testamentaria' : 'Intestamentaria'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <User className="text-[#001529] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#001529] mb-1">Vendedor</h4>
                      <p className="text-slate-600 text-sm">{formData.seller.nombreCompleto}</p>
                      <p className="text-slate-400 text-xs mt-1">{formData.seller.tipo === 'fisica' ? 'Persona Física' : 'Persona Moral'} • {formData.seller.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Building2 className="text-[#001529] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#001529] mb-1">Inmueble</h4>
                      <p className="text-slate-600 text-sm">{formData.property.calle} {formData.property.numeroExterior}</p>
                      <p className="text-slate-400 text-xs mt-1 capitalize">{formData.property.tipo} {formData.property.uso} • {formData.property.colonia}</p>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 animate-shake">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-600 leading-relaxed font-bold">
                        Por favor, completa todos los campos requeridos marcados en rojo antes de continuar.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-[#001529]/5 rounded-2xl border border-[#001529]/10 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#001529] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#001529] leading-relaxed">
                      Al confirmar, se generará automáticamente el expediente con la lista de documentos obligatorios según las condiciones del inmueble y el tipo de vendedor.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between">
          <button 
            onClick={step === 1 ? onClose : prevStep}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {step === 1 ? 'Cancelar' : 'Regresar'}
          </button>

          <button 
            onClick={step === 3 ? () => onConfirm(formData) : nextStep}
            disabled={isSubmitting}
            className="bg-[#001529] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-[#002140] transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70"
          >
            {step === 3 ? (
              isSubmitting ? 'Creando...' : 'Confirmar y Crear'
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateOperationModal;
