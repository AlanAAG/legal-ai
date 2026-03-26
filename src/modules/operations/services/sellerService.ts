import { supabase } from '../../../lib/supabase';
import { mapDbOperationToOperation, mapDbAgentToAgent } from '../../../lib/mappers';
import type { Operation, Agent } from '../../../types';
import type { DbOperation, DbDocumentSlot } from '../../../lib/types/database.types';

export const sellerService = {
  /**
   * Fetches operation data using a public share token
   */
  async getOperationByToken(shareToken: string): Promise<Operation | null> {
    // 1. Get operation via token
    const { data: opData, error: opError } = await supabase
      .from('operations')
      .select('*, agents (*)')
      .eq('share_token', shareToken)
      .single();

    if (opError) {
      console.error('Error fetching operation by token:', opError);
      return null;
    }

    // 2. Get document slots
    const { data: docsData, error: docsError } = await supabase
      .from('document_slots')
      .select('*')
      .eq('operation_id', opData.id);

    if (docsError) throw docsError;

    const agent: Agent = mapDbAgentToAgent(opData.agents);
    return mapDbOperationToOperation(opData as DbOperation, agent, docsData as DbDocumentSlot[]);
  },

  /**
   * Uploads a document via the public editor function
   */
  async uploadPublicDocument(shareToken: string, slotId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slotId', slotId);
    formData.append('shareToken', shareToken);

    const { data, error } = await supabase.functions.invoke('seller-upload', {
      body: formData,
    });

    if (error) throw error;
    return data;
  }
};
