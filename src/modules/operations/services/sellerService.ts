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
   * Uploads a document via public anonymous access
   */
  async uploadPublicDocument(shareToken: string, slotId: string, file: File): Promise<void> {
    console.log(`Public upload initiated for token: ${shareToken.substring(0, 5)}...`);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${slotId}/${fileName}`;

    // 1. Upload to Storage (bucket 'documentos' allows anon insert)
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file);

    if (storageError) throw storageError;

    // 2. Update Document Slot (RLS allows update where true)
    const { error: dbError } = await supabase
      .from('document_slots')
      .update({
        storage_path: filePath,
        file_name: file.name,
        status: 'subido',
        uploaded_at: new Date().toISOString()
      })
      .eq('id', slotId);

    if (dbError) throw dbError;
  }
};
