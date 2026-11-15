import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { normalizeSave, type SaveData } from './storage';

/**
 * Public web config from the teacher's existing Firebase project (mrli-thlch),
 * the same project as https://mrli-thlch.web.app. This apiKey is a client
 * identifier, not a service-account secret. Access is limited by Auth domains
 * and Firestore rules.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCctO55Pm8swkX_9k1mv3CSvpECC1Ss7O4',
  authDomain: 'mrli-thlch.firebaseapp.com',
  projectId: 'mrli-thlch',
  storageBucket: 'mrli-thlch.firebasestorage.app',
  messagingSenderId: '600720221315',
  appId: '1:600720221315:web:e406de13433261a859a7b6',
};

const COLLECTION = 'p6science';

const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export function watchAuth(onChange: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, onChange);
}

export async function finishRedirectSignIn(): Promise<void> {
  try {
    await getRedirectResult(auth);
  } catch {
    /* popup is the main path; a stale redirect should not block the page */
  }
}

export async function signInGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const code = errorCode(error);
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export async function loadCloudSave(uid: string): Promise<SaveData | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return normalizeSave(snap.data());
}

export async function saveCloudSave(uid: string, data: SaveData): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    v: 1,
    coins: data.coins,
    animals: data.animals,
    stats: data.stats,
    solo: data.solo,
    pasture: data.pasture,
    updatedAt: serverTimestamp(),
  });
}

export function authErrorText(error: unknown): string {
  const code = errorCode(error);
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return '已取消登入。';
  if (code === 'auth/popup-blocked') return '登入視窗被瀏覽器封鎖，請允許彈出視窗再試。';
  if (code === 'auth/unauthorized-domain') {
    return '這個網址還未加入 Firebase 授權網域。請老師把 thomasthlch.github.io 加進 Authentication 的授權網域。';
  }
  if (code === 'permission-denied' || code === 'auth/unauthorized') {
    return '已登入，但雲端暫時未能儲存。請老師更新 Firestore 規則，讓每位同學只能讀寫自己的進度。';
  }
  return '暫時未能連上帳號，這部裝置的進度仍然保留。';
}

function errorCode(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) return String((error as { code: unknown }).code);
  return '';
}
