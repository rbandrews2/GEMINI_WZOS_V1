import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure Firebase is initialized only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GOOGLE_MEET_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
];

const provider = new GoogleAuthProvider();
GOOGLE_MEET_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to prevent race conditions during sign in
let isSigningIn = false;
// In-memory access token caching (MANDATORY per Workspace guidelines: NEVER store in localStorage)
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleMeet = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token for Google Meet');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface CreatedMeetSpace {
  name: string; // e.g. "spaces/ABC123XYZ"
  meetingUri: string; // e.g. "https://meet.google.com/abc-defg-hij"
  meetingCode: string; // e.g. "abc-defg-hij"
  config?: Record<string, any>;
}

/**
 * Creates a real Google Meet space using the official Google Meet REST API v2
 * Requires: https://www.googleapis.com/auth/meetings.space.created
 */
export async function createGoogleMeetSpace(accessToken: string): Promise<CreatedMeetSpace> {
  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {
        accessType: 'OPEN',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google Meet space creation failed:', response.status, errorBody);
    throw new Error(
      `Google Meet API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const space = await response.json();
  return {
    name: space.name,
    meetingUri: space.meetingUri,
    meetingCode: space.meetingCode,
    config: space.config,
  };
}
