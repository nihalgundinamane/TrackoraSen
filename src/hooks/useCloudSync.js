import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'userdata';
const DEBOUNCE_MS = 1500; // wait 1.5s after last change before pushing to cloud

/**
 * Syncs a user's anime list with Firestore.
 *
 * Strategy:
 *   - On login: pull from Firestore. If Firestore is empty, push local data up.
 *   - While logged in: listen for remote changes (another device updated).
 *   - On local change: debounce → push to Firestore.
 *   - On logout: stop syncing, data remains in localStorage.
 */
export const useCloudSync = (user, localList, onRemoteUpdate) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error | offline
  const debounceRef = useRef(null);
  const isFirstLoad = useRef(true);
  const unsubRef    = useRef(null);

  // Helper: user's Firestore doc ref
  const docRef = useCallback(() => {
    if (!user) return null;
    return doc(db, COLLECTION, user.uid);
  }, [user]);

  // On login: pull data, then subscribe to remote changes
  useEffect(() => {
    if (!user) {
      // Stop listening when logged out
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      isFirstLoad.current = true;
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');

    const ref = docRef();

    // First: check if cloud has data
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const cloudData = snap.data().list;
        if (cloudData && Array.isArray(cloudData)) {
          onRemoteUpdate(cloudData);  // overwrite local with cloud
        }
      } else {
        // Cloud is empty — push local data up as first sync
        setDoc(ref, { list: localList, updatedAt: serverTimestamp(), uid: user.uid })
          .catch(() => setSyncStatus('error'));
      }
      setSyncStatus('synced');
      isFirstLoad.current = false;
    }).catch(() => {
      setSyncStatus('error');
      isFirstLoad.current = false;
    });

    // Subscribe to real-time changes (e.g. another device made a change)
    unsubRef.current = onSnapshot(ref, (snap) => {
      if (isFirstLoad.current) return; // skip the initial snapshot (handled above)
      if (!snap.exists()) return;
      const cloudData = snap.data().list;
      if (cloudData && Array.isArray(cloudData)) {
        onRemoteUpdate(cloudData);
        setSyncStatus('synced');
      }
    }, () => setSyncStatus('offline'));

    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Push to cloud whenever localList changes (debounced)
  useEffect(() => {
    if (!user || isFirstLoad.current) return;

    setSyncStatus('syncing');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const ref = docRef();
      if (!ref) return;
      setDoc(ref, { list: localList, updatedAt: serverTimestamp(), uid: user.uid })
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, DEBOUNCE_MS);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [localList, user, docRef]);

  return { syncStatus };
};
