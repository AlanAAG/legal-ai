import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operationService } from '../modules/operations/services/operationService';
import type { OperationSummary, CreateOperationInput } from '../modules/operations/services/operationService';
import { 
  Plus, 
  Search, 
  Filter, 
  Home, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  FileText,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import CreateOperationModal from '../modules/operations/components/CreateOperationModal';

const OperationsListPage: React.FC = () => {
  const { agent, user } = useAuth();
  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOperations();
    }
  }, [user]);

  const fetchOperations = async () => {
    try {
      if (!user) return;
      const data = await operationService.listOperations(user.id);
      setOperations(data);
    } catch (err) {
      console.error('Error fetching operations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperation = async (data: CreateOperationInput) => {
    if (!agent || !user) return;
    setIsSubmitting(true);
    try {
      // Create with real agent data
      const mappedAgent = {
        id: user.id,
        nombre: agent.full_name,
        email: agent.email,
        telefono: agent.phone,
        agencia: agent.agency_name,
        esAMPI: agent.is_ampi_member
      };

      const newOp = await operationService.createOperation(data, mappedAgent);
      navigate(`/operaciones/${newOp.id}`);
    } catch (err) {
      console.error('Error creating operation:', err);
      alert('Error al crear la operación. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#001529] tracking-tight">Tus Operaciones</h1>
            <p className="text-slate-500 mt-2 font-medium">Gestiona expedientes y seguimiento documental</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#001529] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#002140] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Nueva Operación
          </button>
        </div>

        {/* Filters/Search */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por dirección o vendedor..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all shadow-sm"
            />
          </div>
          <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {operations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-20 border border-slate-100 shadow-sm flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-[#001529]">No tienes operaciones activas</h3>
            <p className="text-slate-400 max-w-sm mt-4 font-medium">
              Comienza registrando tu primera propiedad para empezar a recolectar documentos legalmente válidos.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-10 bg-[#C5A059] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#B38E46] transition-all shadow-lg shadow-[#C5A059]/30"
            >
              Crea tu primera operación
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {operations.map((op, idx) => {
              const progress = op.totalDocs > 0 ? Math.round((op.uploadedDocs / op.totalDocs) * 100) : 0;
              return (
                <motion.div 
                  key={op.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/operaciones/${op.id}`)}
                  className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#C5A059]/10 transition-colors">
                      <Home className="w-6 h-6 text-[#001529] group-hover:text-[#C5A059] transition-colors" />
                    </div>
                    {progress === 100 ? (
                      <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-[#001529]/5 text-[#001529] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#001529]/10">
                        En Proceso
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-[#001529] group-hover:text-[#C5A059] transition-colors truncate">
                    {op.address}
                  </h3>
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-slate-400 text-sm font-medium">Vendedor: {op.sellerName}</p>
                    {op.bloqueanteCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-lg border border-red-100 italic">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{op.bloqueanteCount} Alertas</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Progreso del Expediente</span>
                      <span className="text-[#001529]">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-[#C5A059] to-[#9C7E46] rounded-full shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(op.createdAt).toLocaleDateString()}
                      </div>
                      <span>{op.uploadedDocs} de {op.totalDocs} docs</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-end">
                    <div className="flex items-center gap-1 text-[#C5A059] font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Ver Detalles
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CreateOperationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreateOperation}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default OperationsListPage;
