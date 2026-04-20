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
  if (!firebaseConfigured || !uid) return;
  const { db } = getFirebase();
  const ref = doc(db, 'users', uid, 'progress', questionId);
  await setDoc(
    ref,
    {
      questionId,
      // Never downgrade a solved question back to attempted/wrong.
      status,
      attempts: prevAttempts + 1,
      lastAnswer: lastAnswer ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Convenience: decide the new status, respecting "solved is sticky". */
export function mergeStatus(
  prev: ProgressStatus | undefined,
  next: ProgressStatus,
): ProgressStatus {
  if (prev === 'solved') return 'solved';
  return next;
}
