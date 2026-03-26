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
  nombre: dbDoc.name,
  descripcion: dbDoc.description,
  categoria: dbDoc.category as DocumentCategory,
  esObligatorio: dbDoc.is_required,
  soloPersona: dbDoc.person_type_trigger,
  condicion: dbDoc.condition_trigger as any,
  estado: dbDoc.status as any,
  archivoNombre: dbDoc.file_name,
  storagePath: dbDoc.storage_path,
  analisisStatus: (dbDoc as any).analisis_status || 'pendiente',
  redFlags: dbDoc.red_flags ? (dbDoc.red_flags as any[]).map(f => ({
    ruleId: f.rule_id,
    severidad: f.severidad,
    mensaje: f.mensaje,
    detectedAt: f.detected_at
  })) : undefined,
  fechaSubida: dbDoc.uploaded_at ? new Date(dbDoc.uploaded_at).toLocaleDateString('es-MX') : undefined
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
