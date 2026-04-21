import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from './firebase';
import { useAuth } from './auth';
import { setSyncStatus } from './syncStatus';
import type { Question } from '../questions/schema';

/**
 * Firestore layout: users/{uid}/generated/{questionId}
 *
 * Each doc stores the full Question payload (so it can be reconstructed
 * without re-running the generator) plus a server-assigned createdAt for
 * stable ordering. The id field on the doc matches the doc id.
 */
export function useGenerated(): Question[] {
  const { user } = useAuth();
  const [list, setList] = useState<Question[]>([]);

  useEffect(() => {
    if (!firebaseConfigured || !user) {
      setList([]);
      return;
    }
    const { db } = getFirebase();
    const col = collection(db, 'users', user.uid, 'generated');
    const q = query(col, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const next: Question[] = [];
      snap.forEach((d) => {
        const data = d.data() as { question?: Question };
        if (data?.question) next.push(data.question);
      });
      setList(next);
    });
  }, [user]);

  return list;
}

export async function saveGenerated(uid: string, q: Question): Promise<void> {
  setSyncStatus({ kind: 'pending', questionId: q.id });
  try {
    const { db } = getFirebase();
    const ref = doc(db, 'users', uid, 'generated', q.id);
    await setDoc(ref, { question: q, createdAt: serverTimestamp() });
    setSyncStatus({ kind: 'ok', questionId: q.id, at: Date.now() });
  } catch (err) {
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    setSyncStatus({ kind: 'error', questionId: q.id, message, at: Date.now() });
    throw err;
  }
}

export async function deleteGenerated(uid: string, id: string): Promise<void> {
  setSyncStatus({ kind: 'pending', questionId: id });
  try {
    const { db } = getFirebase();
    await deleteDoc(doc(db, 'users', uid, 'generated', id));
    setSyncStatus({ kind: 'ok', questionId: id, at: Date.now() });
  } catch (err) {
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    setSyncStatus({ kind: 'error', questionId: id, message, at: Date.now() });
    throw err;
  }
}
