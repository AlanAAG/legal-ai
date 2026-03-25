import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { mockOperation } from '../mock/mockData';
import { OperationSummary } from '../components/OperationSummary';
import { OperationDocuments } from '../components/OperationDocuments';
import { OperationShare } from '../components/OperationShare';

export const OperationDashboard: React.FC = () => {
  const { operationId } = useParams<{ operationId: string }>();
  const [activeTab, setActiveTab] = useState<'resumen' | 'documentos' | 'compartir'>('resumen');

  // For Phase 1 & 2, we only have one mock operation
  if (operationId !== '1') {
    return <Navigate to="/operaciones/1" replace />;
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'compartir', label: 'Compartir' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-1 ml-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operación #{mockOperation.id}
          </h1>
          <p className="text-slate-500 font-medium">
            {mockOperation.inmueble.direccion.calle} {mockOperation.inmueble.direccion.numeroExterior} • {mockOperation.vendedor.nombreCompleto}
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
          {activeTab === 'resumen' && <OperationSummary operation={mockOperation} />}
          {activeTab === 'documentos' && <OperationDocuments operation={mockOperation} />}
          {activeTab === 'compartir' && <OperationShare operation={mockOperation} />}
        </div>
      </div>
    </div>
  );
};
