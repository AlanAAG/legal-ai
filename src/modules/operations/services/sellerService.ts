import { supabase } from '../../../lib/supabase';
import { mapDbOperationToOperation, mapDbAgentToAgent } from '../../../lib/mappers';
import type { Operation, Agent } from '../../../types';
import type { DbOperation, DbDocumentSlot } from '../../../lib/types/database.types';

export const sellerService = {
  /**
   * Fetches operation data using a public share token
   */
  async getOperationByToken(shareToken: string): Promise<Operation | null> {
    // 1. Get operation via token (no join — fetch agent separately)
    const { data: opData, error: opError } = await supabase
      .from('operations')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (opError) {
      console.error('Error fetching operation by token:', opError);
      return null;
    }

    // 1b. Fetch agent separately (avoids FK join issues)
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', opData.agent_id)
      .single();

    if (agentError) {
      console.error('Error fetching agent for seller portal:', agentError);
      return null;
    }

    // 2. Get document slots
    const { data: docsData, error: docsError } = await supabase
      .from('document_slots')
      .select('*')
      .eq('operation_id', opData.id);

    if (docsError) throw docsError;

    const agent: Agent = mapDbAgentToAgent(agentData);
    return mapDbOperationToOperation(opData as DbOperation, agent, docsData as DbDocumentSlot[]);
  },

  /**
   * Uploads a document via public anonymous access
   */
  async uploadPublicDocument(shareToken: string, slotId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slotId', slotId);
    formData.append('shareToken', shareToken);

    const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl('dummy');
    const baseUrl = publicUrl.split('/storage/v1')[0];
    const functionUrl = `${baseUrl}/functions/v1/seller-upload`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al subir el documento');
    }
  }
};
