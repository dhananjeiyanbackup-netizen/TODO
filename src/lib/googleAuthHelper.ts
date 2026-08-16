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

// In-memory token & user state
let inMemoryAccessToken: string | null = null;
let inMemoryUser: GoogleUserInfo | null = null;
let authListeners: Array<(user: GoogleUserInfo | null, token: string | null) => void> = [];

export const notifyAuthListeners = () => {
  authListeners.forEach(listener => listener(inMemoryUser, inMemoryAccessToken));
};

export const subscribeToGoogleAuth = (
  callback: (user: GoogleUserInfo | null, token: string | null) => void
): (() => void) => {
  authListeners.push(callback);
  // Immediately call with current state
  callback(inMemoryUser, inMemoryAccessToken);
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
      // In case it's already loaded or in progress
      setTimeout(resolve, 500);
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
      reject(new Error('Google Identity Services client is not available in this environment.'));
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: WORKSPACE_SCOPES.join(' '),
        prompt: '',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('GIS token error:', tokenResponse);
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

          inMemoryAccessToken = accessToken;
          inMemoryUser = userProfile;
          notifyAuthListeners();

          resolve({ user: userProfile, accessToken });
        },
        error_callback: (err: any) => {
          console.error('GIS error callback:', err);
          reject(new Error(err.message || 'Google Sign-in failed or was closed.'));
        }
      });

      client.requestAccessToken({ prompt: '' });
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

      inMemoryAccessToken = credential.accessToken;
      inMemoryUser = userInfo;
      notifyAuthListeners();

      return { user: userInfo, accessToken: credential.accessToken };
    } catch (fbErr: any) {
      console.error('Firebase Auth sign in failed as well:', fbErr);
      
      // If error is unauthorized-domain, explain clearly and provide guidance
      if (fbErr?.code === 'auth/unauthorized-domain') {
        throw new Error(
          `Domain authorization required or GIS popup blocked. GIS prompt was attempted. Please make sure popups are allowed in your browser.`
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
  return inMemoryAccessToken;
};

/**
 * Set cached access token manually
 */
export const setCachedGoogleToken = (token: string | null, email?: string) => {
  inMemoryAccessToken = token;
  if (token && !inMemoryUser) {
    inMemoryUser = {
      email: email || 'dhananjeiyan.backup@gmail.com',
      name: 'Authorized Google User'
    };
  } else if (!token) {
    inMemoryUser = null;
  }
  notifyAuthListeners();
};

/**
 * Get current Google User details
 */
export const getCurrentGoogleUser = (): GoogleUserInfo | null => {
  if (inMemoryUser) return inMemoryUser;
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
  inMemoryAccessToken = null;
  inMemoryUser = null;
  notifyAuthListeners();
};

// Listen to Firebase auth changes to keep in sync
onAuthStateChanged(auth, (user) => {
  if (user && !inMemoryUser) {
    inMemoryUser = {
      email: user.email || 'dhananjeiyan.backup@gmail.com',
      name: user.displayName || user.email || 'Authorized User',
      photoURL: user.photoURL || undefined,
      uid: user.uid
    };
    notifyAuthListeners();
  } else if (!user && !inMemoryAccessToken) {
    inMemoryUser = null;
    notifyAuthListeners();
  }
});
