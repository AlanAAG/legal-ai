import type { DbAgent, DbOperation, DbDocumentSlot } from './types/database.types';
import type { Agent, Operation, Seller, Property, DocumentSlot, DocumentCategory } from '../types';

export const mapDbAgentToAgent = (dbAgent: DbAgent): Agent => ({
  id: dbAgent.id,
  nombre: dbAgent.nombre,
  email: dbAgent.email,
  telefono: dbAgent.telefono,
  agencia: dbAgent.agencia,
  esAMPI: dbAgent.es_ampi
});

export const mapDbDocumentSlotToDocumentSlot = (dbDoc: DbDocumentSlot): DocumentSlot => ({
  id: dbDoc.id,
  name: dbDoc.name,
  description: dbDoc.description,
  category: dbDoc.category as DocumentCategory,
  is_required: dbDoc.is_required,
  soloPersona: dbDoc.person_type_trigger,
  condicion: dbDoc.condition_trigger as any,
  status: dbDoc.status as any,
  file_name: dbDoc.file_name,
  storagePath: dbDoc.storage_path,
  analysis_status: dbDoc.analysis_status as any,
  uploaded_at: dbDoc.uploaded_at || undefined
});

export const mapDbOperationToOperation = (
  dbOp: DbOperation, 
  agent: Agent,
  dbDocs: DbDocumentSlot[]
): Operation => {
  const seller: Seller = {
    id: `seller-${dbOp.id}`,
    nombreCompleto: dbOp.seller_name,
    tipo: dbOp.seller_type,
    telefono: dbOp.seller_phone,
    email: dbOp.seller_email
  };

  const property: Property = {
    id: `prop-${dbOp.id}`,
    tipo: dbOp.property_type,
    uso: dbOp.property_use,
    direccion: {
      calle: dbOp.property_street,
      numeroExterior: dbOp.property_number,
      colonia: dbOp.property_colony,
      alcaldia: dbOp.property_municipality,
      codigoPostal: dbOp.property_zip,
      estado: dbOp.property_state
    },
    esCondominio: dbOp.is_condominium,
    tieneConstruccionOAmpliacion: dbOp.has_construction_extension,
    sucesionTipo: dbOp.succession_type
  };

  return {
    id: dbOp.id,
    shareToken: dbOp.share_token,
    agente: agent,
    vendedor: seller,
    inmueble: property,
    documentos: dbDocs.map(mapDbDocumentSlotToDocumentSlot),
    createdAt: dbOp.created_at
  };
};
