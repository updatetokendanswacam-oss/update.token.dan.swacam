import { useState, useEffect } from 'react';
import { syncManager, SyncState } from '../utils/syncManager';

export function useSyncStatus(): {
  syncState: SyncState;
  isOnline: boolean;
  reconnect: () => void;
} {
  const [syncState, setSyncState] = useState<SyncState>(() => syncManager.getState());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  return {
    syncState,
    isOnline: syncState !== 'offline',
    reconnect: () => syncManager.attemptAutoReconnect(),
  };
}
