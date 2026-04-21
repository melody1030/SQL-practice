import { useSyncExternalStore } from 'react';

/**
 * Tiny store for surfacing the most recent progress-sync event.
 * Lets the nav show a ✓ / ✗ so silent Firestore failures are visible.
 */
export type SyncStatus =
  | { kind: 'idle' }
  | { kind: 'pending'; questionId: string }
  | { kind: 'ok'; questionId: string; at: number }
  | { kind: 'error'; questionId: string; message: string; at: number };

let current: SyncStatus = { kind: 'idle' };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setSyncStatus(next: SyncStatus) {
  current = next;
  emit();
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => current,
  );
}
