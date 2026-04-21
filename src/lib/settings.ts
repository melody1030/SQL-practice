import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from './firebase';
import { useAuth } from './auth';
import { setSyncStatus } from './syncStatus';

/**
 * Per-user app settings live in users/{uid}/settings/app as a single doc.
 * Currently only `geminiKey`. Stored as plain text in Firestore — rules
 * already restrict the subtree to the owning user, but the user is the
 * one supplying the key so they accept the trust model.
 */
export interface AppSettings {
  geminiKey?: string;
}

export function useSettings(): {
  settings: AppSettings;
  loading: boolean;
  saveGeminiKey: (key: string) => Promise<void>;
} {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState<boolean>(!!user);

  useEffect(() => {
    if (!firebaseConfigured || !user) {
      setSettings({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { db } = getFirebase();
    const ref = doc(db, 'users', user.uid, 'settings', 'app');
    return onSnapshot(ref, (snap) => {
      setSettings((snap.data() as AppSettings | undefined) ?? {});
      setLoading(false);
    });
  }, [user]);

  return {
    settings,
    loading,
    async saveGeminiKey(key: string) {
      if (!firebaseConfigured || !user) {
        throw new Error('Sign in to save your Gemini key.');
      }
      setSyncStatus({ kind: 'pending', questionId: 'settings' });
      try {
        const { db } = getFirebase();
        const ref = doc(db, 'users', user.uid, 'settings', 'app');
        await setDoc(ref, { geminiKey: key }, { merge: true });
        setSyncStatus({ kind: 'ok', questionId: 'settings', at: Date.now() });
      } catch (err) {
        const message =
          err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        setSyncStatus({
          kind: 'error',
          questionId: 'settings',
          message,
          at: Date.now(),
        });
        throw err;
      }
    },
  };
}
