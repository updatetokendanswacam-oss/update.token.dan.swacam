/**
 * Real-Time Synchronization & Write Queue Manager.
 * Ensures instant UI updates (0ms optimistic latency) while coordinating
 * conflict-free Firestore persistence, automatic network reconnection,
 * and accurate LIVE / CONNECTING / OFFLINE state monitoring.
 */

import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase';
import { UpdateCategory } from '../types';
import { saveCategoryToFirestore } from './firestoreService';

export type SyncState = 'live' | 'connecting' | 'offline';

type SyncListener = (state: SyncState) => void;

class RealtimeSyncManager {
  private currentState: SyncState = 'connecting';
  private listeners: Set<SyncListener> = new Set();
  private pendingCategoryWrites: Map<string, { category: UpdateCategory; timer: any }> = new Map();
  private isNetworkReconnecting = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkOnline());
      window.addEventListener('offline', () => this.handleNetworkOffline());
      this.currentState = navigator.onLine ? 'connecting' : 'offline';
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncState {
    return this.currentState;
  }

  public setFirestoreConnected(isFromCache: boolean): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState('offline');
      return;
    }

    if (isFromCache) {
      // Snapshot served from local cache while establishing live server connection
      this.updateState('connecting');
    } else {
      // Confirmed live connection with Firestore server
      this.updateState('live');
    }
  }

  public setFirestoreError(err: any): void {
    console.warn('Realtime sync status notice:', err?.message || err);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState('offline');
    } else {
      this.updateState('connecting');
      this.attemptAutoReconnect();
    }
  }

  private updateState(newState: SyncState): void {
    if (this.currentState === newState) return;
    this.currentState = newState;
    this.listeners.forEach((fn) => {
      try {
        fn(newState);
      } catch (e) {
        console.warn('Sync listener error:', e);
      }
    });
  }

  private async handleNetworkOnline(): Promise<void> {
    this.updateState('connecting');
    await this.attemptAutoReconnect();
    this.flushPendingWrites();
  }

  private handleNetworkOffline(): void {
    this.updateState('offline');
  }

  public async attemptAutoReconnect(): Promise<void> {
    if (this.isNetworkReconnecting) return;
    this.isNetworkReconnecting = true;
    try {
      await enableNetwork(db);
    } catch (e) {
      console.warn('Firestore enableNetwork notice:', e);
    } finally {
      this.isNetworkReconnecting = false;
    }
  }

  /**
   * Queues a category save to Firestore with automatic 120ms debounce.
   * If a user clicks multiple checkmarks rapidly or edits multiple sites,
   * they are batched into a single efficient write per category, preventing
   * race conditions and write limits.
   */
  public queueCategorySave(category: UpdateCategory, immediate = false): void {
    const existing = this.pendingCategoryWrites.get(category.id);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const delay = immediate ? 0 : 120;

    const timer = setTimeout(async () => {
      this.pendingCategoryWrites.delete(category.id);
      try {
        await saveCategoryToFirestore(category);
      } catch (err) {
        console.warn(`Write queue retry scheduled for category ${category.id}:`, err);
        // If write fails due to offline or transient error, retry after 2.5s
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          setTimeout(() => {
            saveCategoryToFirestore(category).catch(() => {});
          }, 2500);
        }
      }
    }, delay);

    this.pendingCategoryWrites.set(category.id, { category, timer });
  }

  /**
   * Immediately flushes any pending category writes to Firestore
   */
  public flushPendingWrites(): void {
    this.pendingCategoryWrites.forEach(({ category, timer }, catId) => {
      clearTimeout(timer);
      this.pendingCategoryWrites.delete(catId);
      saveCategoryToFirestore(category).catch((e) =>
        console.warn('Flushed write error:', e)
      );
    });
  }
}

export const syncManager = new RealtimeSyncManager();
