import { useEffect } from 'react';
import { analysisService } from '../modules/operations/services/analysisService';

/**
 * Hook to subscribe to real-time updates for a specific document slot
 * @param slotId The ID of the slot to watch
 * @param onComplete Callback triggered when analysis completes
 * @param enabled Whether the polling is currently active
 */
export function useRealtimeSlot(
  slotId: string | undefined,
  onComplete: () => void,
  enabled: boolean = false
) {
  useEffect(() => {
    if (!slotId || !enabled) return;

    const unsubscribe = analysisService.pollSlotStatus(slotId, () => {
      onComplete();
    });

    return () => {
      unsubscribe();
    };
  }, [slotId, enabled, onComplete]);
}
