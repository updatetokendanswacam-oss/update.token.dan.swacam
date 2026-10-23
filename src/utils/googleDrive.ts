import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure Firebase is initialized only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const TARGET_DRIVE_ID = '10SRjggSklTu7YbiArs3K-Pfl3macje542DA38xmJjkM';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

// In-memory token cache (Do NOT store in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveResource {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

export interface DriveSyncResult {
  success: boolean;
  resource?: DriveResource;
  filesCount?: number;
  importedSitesCount?: number;
  csvContent?: string;
  message: string;
}

// Auth state listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Fetch Google Drive Resource details by ID
export async function fetchDriveResource(
  fileId: string = TARGET_DRIVE_ID,
  token?: string
): Promise<DriveResource> {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Akses Google Drive belum diautentikasi. Silakan Masuk dengan Google.');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,description,modifiedTime,size,webViewLink,webContentLink,owners`,
    {
      headers: { Authorization: `Bearer ${activeToken}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error?.message || `Gagal mengakses berkas (HTTP ${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}

// Fetch file contents (handles Google Sheets export to CSV or plain text)
export async function fetchDriveFileContent(
  fileId: string = TARGET_DRIVE_ID,
  mimeType?: string,
  token?: string
): Promise<string> {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Akses Google Drive belum diautentikasi.');
  }

  // If it's a Google Spreadsheet, export as CSV
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
      {
        headers: { Authorization: `Bearer ${activeToken}` },
      }
    );
    if (!exportRes.ok) {
      throw new Error(`Gagal mengekspor Spreadsheet Google: HTTP ${exportRes.status}`);
    }
    return await exportRes.text();
  }

  // Direct download for CSV or text files
  const downloadRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${activeToken}` },
    }
  );

  if (!downloadRes.ok) {
    throw new Error(`Gagal mengunduh berkas Google Drive: HTTP ${downloadRes.status}`);
  }

  return await downloadRes.text();
}

// Upload/Save a backup or photo to Google Drive
export async function uploadToDrive(
  fileName: string,
  content: string | Blob,
  mimeType: string,
  folderId?: string,
  token?: string
): Promise<DriveResource> {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Akses Google Drive belum diautentikasi.');
  }

  const doUpload = async (targetFolder?: string) => {
    const metadata: any = {
      name: fileName,
      mimeType: mimeType,
    };

    if (targetFolder) {
      metadata.parents = [targetFolder];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let contentBody = '';
    if (typeof content === 'string') {
      contentBody = content;
    } else {
      contentBody = await content.text();
    }

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      contentBody +
      closeDelimiter;

    return await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );
  };

  let res = await doUpload(folderId);

  // If upload failed and a folderId was provided, retry without parents in case target is a file or sheet
  if (!res.ok && folderId) {
    const retryRes = await doUpload(undefined);
    if (retryRes.ok) {
      res = retryRes;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengunggah ke Google Drive: HTTP ${res.status}`);
  }

  return await res.json();
}

// List files within folder ID (for File Explorer browsing)
export async function listFilesInFolder(
  folderId: string = TARGET_DRIVE_ID,
  token?: string
): Promise<DriveResource[]> {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Akses Google Drive belum diautentikasi.');
  }

  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,description,modifiedTime,size,webViewLink,webContentLink)&orderBy=modifiedTime desc`,
      {
        headers: { Authorization: `Bearer ${activeToken}` },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('List files error:', err);
    return [];
  }
}

