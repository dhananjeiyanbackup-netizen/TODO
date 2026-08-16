import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebase';
import firebaseConfigData from '../../firebase-applet-config.json';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

const CLIENT_ID = firebaseConfigData.oAuthClientId || '111485637605-qd92oushrnmc5le4mbs1f39h1vff3i9u.apps.googleusercontent.com';

const auth = getAuth(app);
const firebaseProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => firebaseProvider.addScope(scope));

export interface GoogleUserInfo {
  email: string;
  name?: string;
  photoURL?: string;
  uid?: string;
}

const STORAGE_KEY_TOKEN = 'google_workspace_oauth_token';
const STORAGE_KEY_USER = 'google_workspace_user_profile';

// Initialize from localStorage if available
let inMemoryAccessToken: string | null = null;
let inMemoryUser: GoogleUserInfo | null = null;

try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedToken) inMemoryAccessToken = savedToken;
    if (savedUser) {
      try {
        inMemoryUser = JSON.parse(savedUser);
      } catch {
        inMemoryUser = { email: 'dhananjeiyan.backup@gmail.com', name: 'Authorized Google User' };
      }
    }
  }
} catch (e) {
  console.warn('LocalStorage not accessible for token init:', e);
}

let authListeners: Array<(user: GoogleUserInfo | null, token: string | null) => void> = [];

export const notifyAuthListeners = () => {
  authListeners.forEach(listener => {
    try {
      listener(inMemoryUser, inMemoryAccessToken);
    } catch (e) {
      console.warn('Error in auth listener:', e);
    }
  });
};

export const subscribeToGoogleAuth = (
  callback: (user: GoogleUserInfo | null, token: string | null) => void
): (() => void) => {
  authListeners.push(callback);
  // Immediately call with current state
  try {
    callback(inMemoryUser, inMemoryAccessToken);
  } catch (e) {
    console.warn('Error in initial auth callback:', e);
  }
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

/**
 * Dynamically ensures Google Identity Services script is loaded
 */
export const loadGoogleGsiScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      setTimeout(resolve, 300);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // continue even on error to allow fallback
    document.head.appendChild(script);
  });
};

/**
 * Perform sign-in via Google Identity Services Token Client.
 * Bypasses Firebase Auth domain restrictions completely.
 */
export const signInWithGsiTokenClient = async (): Promise<{ user: GoogleUserInfo; accessToken: string }> => {
  await loadGoogleGsiScript();

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services client is initializing. Please try clicking Connect again.'));
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: WORKSPACE_SCOPES.join(' '),
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('GIS token error:', tokenResponse);
            if (tokenResponse.error === 'popup_blocked_by_browser' || tokenResponse.error === 'popup_closed_by_user') {
              reject(new Error('Popup was blocked by your browser. Please allow popups for this site or use direct authorize.'));
              return;
            }
            reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google Authorization failed.'));
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error('No access token returned by Google OAuth.'));
            return;
          }

          const accessToken = tokenResponse.access_token;
          let userProfile: GoogleUserInfo = {
            email: 'dhananjeiyan.backup@gmail.com',
            name: 'Authorized Google User'
          };

          try {
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userinfoRes.ok) {
              const uData = await userinfoRes.json();
              userProfile = {
                email: uData.email || 'dhananjeiyan.backup@gmail.com',
                name: uData.name || uData.email,
                photoURL: uData.picture,
                uid: uData.sub
              };
            }
          } catch (e) {
            console.warn('Could not fetch userinfo from Google:', e);
          }

          setCachedGoogleToken(accessToken, userProfile.email, userProfile);

          resolve({ user: userProfile, accessToken });
        },
        error_callback: (err: any) => {
          console.error('GIS error callback:', err);
          if (err?.type === 'popup_failed_to_open' || err?.type === 'popup_blocked_by_browser') {
            reject(new Error('Popup was blocked by your browser. Please allow popups for this window and retry.'));
          } else {
            reject(new Error(err?.message || 'Google Sign-in popup closed or blocked.'));
          }
        }
      });

      client.requestAccessToken();
    } catch (err: any) {
      console.error('Error initiating GIS token client:', err);
      reject(err);
    }
  });
};

/**
 * Universal Google Sign-In:
 * Attempts GIS token client first (which bypasses Firebase unauthorized-domain),
 * and falls back to Firebase Auth signInWithPopup if needed.
 */
export const universalGoogleSignIn = async (): Promise<{ user: GoogleUserInfo; accessToken: string }> => {
  // 1. Try GIS token client first (works directly on all domains including Cloud Run preview URLs)
  try {
    const gsiResult = await signInWithGsiTokenClient();
    return gsiResult;
  } catch (gsiErr: any) {
    console.warn('GIS Token client attempt note:', gsiErr.message);

    // If popup was blocked specifically, give actionable message
    if (gsiErr.message && gsiErr.message.toLowerCase().includes('popup')) {
      throw gsiErr;
    }

    // 2. Fallback: Firebase Auth signInWithPopup
    try {
      const fbResult = await signInWithPopup(auth, firebaseProvider);
      const credential = GoogleAuthProvider.credentialFromResult(fbResult);
      if (!credential?.accessToken) {
        throw new Error('Failed to obtain access token from Firebase credential.');
      }
      const userInfo: GoogleUserInfo = {
        email: fbResult.user.email || 'dhananjeiyan.backup@gmail.com',
        name: fbResult.user.displayName || fbResult.user.email || 'Authorized User',
        photoURL: fbResult.user.photoURL || undefined,
        uid: fbResult.user.uid
      };

      setCachedGoogleToken(credential.accessToken, userInfo.email, userInfo);

      return { user: userInfo, accessToken: credential.accessToken };
    } catch (fbErr: any) {
      console.error('Firebase Auth sign in failed as well:', fbErr);
      
      if (fbErr?.code === 'auth/popup-blocked') {
        throw new Error(
          'Google Sign-in popup was blocked by your browser. Please click the popup blocker icon in your browser address bar to allow popups, or connect using the direct button.'
        );
      }
      if (fbErr?.code === 'auth/unauthorized-domain') {
        throw new Error(
          'Domain not whitelisted in Firebase Auth. Please use the Google Identity direct authorization button.'
        );
      }
      throw fbErr;
    }
  }
};

/**
 * Get current cached access token
 */
export const getCachedGoogleToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (stored) {
        inMemoryAccessToken = stored;
        return stored;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return null;
};

/**
 * Set cached access token manually
 */
export const setCachedGoogleToken = (token: string | null, email?: string, fullProfile?: GoogleUserInfo) => {
  inMemoryAccessToken = token;
  if (token) {
    inMemoryUser = fullProfile || {
      email: email || 'dhananjeiyan.backup@gmail.com',
      name: 'Authorized Google User'
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(inMemoryUser));
      }
    } catch (e) {
      console.warn('Could not persist token to localStorage:', e);
    }
  } else {
    inMemoryUser = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.warn('Could not clear token from localStorage:', e);
    }
  }
  notifyAuthListeners();
};

/**
 * Get current Google User details
 */
export const getCurrentGoogleUser = (): GoogleUserInfo | null => {
  if (inMemoryUser) return inMemoryUser;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        inMemoryUser = JSON.parse(savedUser);
        return inMemoryUser;
      }
    }
  } catch (e) {
    console.warn('LocalStorage user read error:', e);
  }
  const fbUser = auth.currentUser;
  if (fbUser) {
    return {
      email: fbUser.email || 'dhananjeiyan.backup@gmail.com',
      name: fbUser.displayName || fbUser.email || 'Authorized User',
      photoURL: fbUser.photoURL || undefined,
      uid: fbUser.uid
    };
  }
  return null;
};

/**
 * Sign out
 */
export const universalGoogleSignOut = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  setCachedGoogleToken(null);
};

// Listen to Firebase auth changes to keep in sync
onAuthStateChanged(auth, (user) => {
  if (user && !inMemoryUser) {
    const userInfo = {
      email: user.email || 'dhananjeiyan.backup@gmail.com',
      name: user.displayName || user.email || 'Authorized User',
      photoURL: user.photoURL || undefined,
      uid: user.uid
    };
    inMemoryUser = userInfo;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userInfo));
      }
    } catch (e) {}
    notifyAuthListeners();
  }
});

