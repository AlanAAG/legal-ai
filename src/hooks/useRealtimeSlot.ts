import { useEffect, useRef } from 'react';
import { analysisService } from '../modules/operations/services/analysisService';

/**
 * Hook to subscribe to real-time updates for a specific document slot.
 * Uses a ref for the callback to prevent unnecessary subscription teardowns.
 * @param slotId The ID of the slot to watch
 * @param onComplete Callback triggered when analysis completes
 * @param enabled Whether the polling is currently active
 */
export function useRealtimeSlot(
  slotId: string | undefined,
  onComplete: () => void,
  enabled: boolean = false
) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!slotId || !enabled) return;

    const unsubscribe = analysisService.pollSlotStatus(slotId, () => {
      onCompleteRef.current();
    });

    return () => {
      unsubscribe();
    };
  }, [slotId, enabled]);
}
