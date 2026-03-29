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
    const fileName = storagePath.split('/').pop() || '';
    
    // MOCK MODE: Demo-Proof Wizard of Oz
    if (fileName.toLowerCase().includes('demo_donacion')) {
      console.log('--- WIZARD OF OZ MODE ACTIVATED (PERSISTENT & RELATIONAL) ---');
      
      // 1. Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFlags = [
        {
          type: 'legal_blocker',
          title: "🛑 Régimen de Sociedad Conyugal",
          description: "Se detectó régimen mancomunado. Es obligatoria la firma e INE del cónyuge para proceder.",
          severity: 'critical'
        },
        {
          type: 'financial_warning',
          title: "⚠️ Adquisición por Donación",
          description: "La propiedad fue adquirida por donación. No es apta para la mayoría de los créditos hipotecarios bancarios.",
          severity: 'high'
        }
      ];

      // 2. Persist mock results into the NEW relational table (detected_red_flags)
      for (const alerta of mockFlags) {
        await supabase.from('detected_red_flags').insert({ 
          document_slot_id: slotId, 
          type: alerta.type, 
          title: alerta.title, 
          description: alerta.description, 
          severity: alerta.severity 
        });
      }

      // 3. Update the document slot status to 'analyzed'
      await supabase
        .from('document_slots')
        .update({
          analysis_status: 'analyzed',
          status: 'flagged'
        })
        .eq('id', slotId);
        
      return;
    }

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
          if (updatedSlot.analysis_status === 'analyzed') {
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
