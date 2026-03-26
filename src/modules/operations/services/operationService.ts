import { supabase } from '../../../lib/supabase';
import type { DbOperation, DbDocumentSlot } from '../../../lib/types/database.types';
import { mapDbOperationToOperation, mapDbAgentToAgent } from '../../../lib/mappers';
import type { Operation, Agent, SellerType, PropertyType, PropertyUsage, SuccessionType } from '../../../types';
import { ALL_DOCUMENT_SLOTS } from '../mock/mockData';

export interface CreateOperationInput {
  seller: {
    nombreCompleto: string;
    tipo: SellerType;
    telefono: string;
    email: string;
  };
  property: {
    tipo: PropertyType;
    uso: PropertyUsage;
    calle: string;
    numeroExterior: string;
    colonia: string;
    alcaldia: string;
    codigoPostal: string;
    estado: string;
    esCondominio: boolean;
    tieneConstruccionOAmpliacion: boolean;
    sucesionTipo: SuccessionType;
  };
}

export interface OperationSummary {
  id: string;
  address: string;
  sellerName: string;
  totalDocs: number;
  uploadedDocs: number;
  bloqueanteCount: number;
  createdAt: string;
}

export const operationService = {
  async listOperations(agentId: string): Promise<OperationSummary[]> {
    const { data, error } = await supabase
      .from('operations')
      .select(`
        id, 
        property_street, 
        property_number, 
        seller_name, 
        created_at,
        document_slots (status)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((op: any) => ({
      id: op.id,
      address: `${op.property_street} ${op.property_number}`,
      sellerName: op.seller_name,
      totalDocs: op.document_slots.length,
      uploadedDocs: op.document_slots.filter((s: any) => s.status === 'subido' || s.status === 'validado' || s.status === 'con_alerta').length,
      bloqueanteCount: op.document_slots.filter((s: any) => s.status === 'con_alerta').length,
      createdAt: op.created_at
    }));
  },

  async getOperation(operationId: string): Promise<Operation | null> {
    // Fetch operation, tracks agent and document slots
    const { data: opData, error: opError } = await supabase
      .from('operations')
      .select(`
        *,
        agents (*)
      `)
      .eq('id', operationId)
      .single();

    if (opError) {
      if (opError.code === 'PGRST116') return null;
      throw opError;
    }

    const { data: docsData, error: docsError } = await supabase
      .from('document_slots')
      .select('*')
      .eq('operation_id', operationId);

    if (docsError) throw docsError;

    const agent: Agent = mapDbAgentToAgent(opData.agents);
    return mapDbOperationToOperation(opData as DbOperation, agent, docsData as DbDocumentSlot[]);
  },

  async createOperation(input: CreateOperationInput, agent: Agent): Promise<Operation> {
    // 1. Insert Operation
    const { data: dbOp, error: opError } = await supabase
      .from('operations')
      .insert({
        agent_id: agent.id,
        seller_name: input.seller.nombreCompleto,
        seller_type: input.seller.tipo,
        seller_phone: input.seller.telefono,
        seller_email: input.seller.email,
        property_type: input.property.tipo,
        property_use: input.property.uso,
        property_street: input.property.calle,
        property_number: input.property.numeroExterior,
        property_colony: input.property.colonia,
        property_municipality: input.property.alcaldia,
        property_zip: input.property.codigoPostal,
        property_state: input.property.estado,
        is_condominium: input.property.esCondominio,
        has_construction_extension: input.property.tieneConstruccionOAmpliacion,
        succession_type: input.property.sucesionTipo
      })
      .select()
      .single();

    if (opError) throw opError;

    // 2. Generate Document Slots based on template logic
    const applicableSlots = ALL_DOCUMENT_SLOTS.filter(slot => {
      // Logic from Phase 4
      if (slot.soloPersona && slot.soloPersona !== input.seller.tipo) return false;
      
      if (slot.condicion === 'condominio' && !input.property.esCondominio) return false;
      if (slot.condicion === 'construccion' && !input.property.tieneConstruccionOAmpliacion) return false;
      if (slot.condicion === 'sucesionTestamentaria' && input.property.sucesionTipo !== 'testamentaria') return false;
      if (slot.condicion === 'sucesionIntestamentaria' && input.property.sucesionTipo !== 'intestamentaria') return false;
      
      return true;
    });

    const slotsToInsert = applicableSlots.map(slot => ({
      operation_id: dbOp.id,
      name: slot.nombre,
      description: slot.descripcion,
      category: slot.categoria,
      is_required: slot.esObligatorio,
      condition_trigger: slot.condicion,
      person_type_trigger: slot.soloPersona,
      status: 'pendiente'
    }));

    const { data: dbDocs, error: docsError } = await supabase
      .from('document_slots')
      .insert(slotsToInsert)
      .select();

    if (docsError) throw docsError;

    return mapDbOperationToOperation(dbOp as DbOperation, agent, dbDocs as DbDocumentSlot[]);
  },

  async getOperationByToken(token: string): Promise<Operation | null> {
    const { data: opData, error: opError } = await supabase
      .from('operations')
      .select(`
        *,
        agents (*)
      `)
      .eq('share_token', token)
      .single();

    if (opError) {
      if (opError.code === 'PGRST116') return null;
      throw opError;
    }

    const { data: docsData, error: docsError } = await supabase
      .from('document_slots')
      .select('*')
      .eq('operation_id', opData.id);

    if (docsError) throw docsError;

    const agent: Agent = mapDbAgentToAgent(opData.agents);
    return mapDbOperationToOperation(opData as DbOperation, agent, docsData as DbDocumentSlot[]);
  }
};
