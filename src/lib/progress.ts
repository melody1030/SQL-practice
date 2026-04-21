import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from './firebase';
import { useAuth } from './auth';
import { setSyncStatus } from './syncStatus';
import type { ProgressEntry } from '../questions/schema';

/**
 * Firestore layout: users/{uid}/progress/{questionId}
 * One doc per question per user; merges increment `attempts` and refresh `status`.
 */
export type ProgressStatus = ProgressEntry['status'];

export type ProgressMap = Record<string, ProgressEntry>;

/** Subscribe to the signed-in user's progress. Returns {} when signed out or Firebase unconfigured. */
export function useProgress(): ProgressMap {
  const { user } = useAuth();
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    if (!firebaseConfigured || !user) {
      setMap({});
      return;
    }
    const { db } = getFirebase();
    const col = collection(db, 'users', user.uid, 'progress');
    return onSnapshot(col, (snap) => {
      const next: ProgressMap = {};
      snap.forEach((d) => {
        const data = d.data() as Partial<ProgressEntry> & { updatedAt?: unknown };
        next[d.id] = {
          questionId: d.id,
          status: (data.status as ProgressStatus) ?? 'attempted',
          attempts: typeof data.attempts === 'number' ? data.attempts : 1,
          lastAnswer: data.lastAnswer,
          updatedAt:
            typeof data.updatedAt === 'number'
              ? data.updatedAt
              : Date.now(),
        };
      });
      setMap(next);
    });
  }, [user]);

  return map;
}

/**
 * Record an attempt. Safe to call when signed out or Firebase unconfigured — it no-ops.
 * We compute the next `attempts` count from the current map so a session that already
 * holds a subscription reflects the write immediately (Firestore will reconcile).
 */
export async function recordAttempt(
  uid: string | undefined,
  questionId: string,
  status: ProgressStatus,
  lastAnswer: string | undefined,
  prevAttempts: number,
): Promise<void> {
  if (!firebaseConfigured) {
    console.warn(
      '[progress] skipped: Firebase not configured — populate .env.local and restart `npm run dev`',
    );
    setSyncStatus({
      kind: 'error',
      questionId,
      message: 'Firebase not configured',
      at: Date.now(),
    });
    return;
  }
  if (!uid) {
    console.warn('[progress] skipped: not signed in (SIGN_IN in nav)');
    setSyncStatus({
      kind: 'error',
      questionId,
      message: 'Not signed in',
      at: Date.now(),
    });
    return;
  }

  setSyncStatus({ kind: 'pending', questionId });
  try {
    const { db } = getFirebase();
    const ref = doc(db, 'users', uid, 'progress', questionId);
    await setDoc(
      ref,
      {
        questionId,
        // "solved" should already be sticky from mergeStatus(); enforce here too.
        status,
        attempts: prevAttempts + 1,
        lastAnswer: lastAnswer ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.info(
      `[progress] wrote users/${uid}/progress/${questionId} status=${status} attempts=${
        prevAttempts + 1
      }`,
    );
    setSyncStatus({ kind: 'ok', questionId, at: Date.now() });
  } catch (err) {
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[progress] write failed', err);
    setSyncStatus({ kind: 'error', questionId, message, at: Date.now() });
    throw err;
  }
}

/** Convenience: decide the new status, respecting "solved is sticky". */
export function mergeStatus(
  prev: ProgressStatus | undefined,
  next: ProgressStatus,
): ProgressStatus {
  if (prev === 'solved') return 'solved';
  return next;
}
