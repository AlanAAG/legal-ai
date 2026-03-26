import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { operationService } from '../services/operationService';
import { OperationSummary } from '../components/OperationSummary';
import { OperationDocuments } from '../components/OperationDocuments';
import { OperationShare } from '../components/OperationShare';
import type { Operation } from '../../../types';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export const OperationDashboard: React.FC = () => {
  const { operationId } = useParams<{ operationId: string }>();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'documentos' | 'compartir'>('resumen');

  useEffect(() => {
    if (operationId) {
      fetchOperation();
    }
  }, [operationId]);

  const fetchOperation = async () => {
    try {
      setLoading(true);
      const data = await operationService.getOperation(operationId!);
      if (data) {
        setOperation(data);
      } else {
        setError('Operación no encontrada.');
      }
    } catch (err) {
      console.error('Error fetching operation:', err);
      setError('Error al cargar la operación. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'compartir', label: 'Compartir' },
  ] as const;

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
        <div className="bg-white rounded-[32px] p-12 max-w-md w-full text-center border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-[#001529] mb-2">{error || 'Error'}</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">No pudimos encontrar la información solicitada.</p>
          <Link to="/operaciones" className="inline-flex items-center gap-2 text-[#C5A059] font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            <ChevronLeft className="w-4 h-4" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <Link to="/operaciones" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors mb-2">
          <ChevronLeft className="w-4 h-4" />
          Operaciones
        </Link>

        {/* Header Section */}
        <div className="space-y-1 ml-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operación #{operation.id.slice(0, 8)}
          </h1>
          <p className="text-slate-500 font-medium">
            {operation.inmueble.direccion.calle} {operation.inmueble.direccion.numeroExterior} • {operation.vendedor.nombreCompleto}
          </p>
        </div>

        {/* Tab System */}
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 text-sm font-bold transition-all relative ${
                  activeTab === tab.id 
                  ? 'text-slate-900 border-b-2 border-slate-900' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === 'resumen' && (
            <OperationSummary 
              operation={operation} 
              onViewDocuments={() => setActiveTab('documentos')}
            />
          )}
          {activeTab === 'documentos' && (
            <OperationDocuments 
              operation={operation} 
              onRefresh={fetchOperation}
            />
          )}
          {activeTab === 'compartir' && <OperationShare operation={operation} />}
        </div>
      </div>
    </div>
  );
};
