import { supabase } from '../../../lib/supabase';
import type { DbDocumentSlot } from '../../../lib/types/database.types';

export const analysisService = {
  /**
   * Triggers the Supabase Edge Function to analyze a document
   */
  async triggerAnalysis(
    slotId: string, 
    operationId: string, 
    storagePath: string
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('analyze-document', {
      body: { slotId, operationId, storagePath }
    });

    if (error) throw error;
  },

  /**
   * Polls for changes on a specific document slot using Realtime Subscriptions
   * @param slotId The ID of the document slot to watch
   * @param onComplete Callback when analysis_status is 'completado'
   * @returns Unsubscribe function
   */
  pollSlotStatus(
    slotId: string, 
    onComplete: (slot: DbDocumentSlot) => void
  ): () => void {
    const channel = supabase
      .channel(`slot-analysis-${slotId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'document_slots',
          filter: `id=eq.${slotId}`
        },
        (payload) => {
          const updatedSlot = payload.new as DbDocumentSlot;
          if (updatedSlot.analisis_status === 'completado') {
            onComplete(updatedSlot);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
