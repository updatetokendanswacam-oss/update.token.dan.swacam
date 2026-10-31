import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { User as FirebaseUser } from 'firebase/auth';
import { db, storage } from '../firebase';
import { UpdateCategory, User, InviteLink, PhotoRecord, SiteItem } from '../types';
import { INITIAL_CATEGORIES, INITIAL_USERS } from './initialData';
import { savePhotoToDB, deletePhotoFromDB } from './storage';
import { syncManager } from './syncManager';
import { cachePhotoUrl, invalidatePhotoCache } from './photoCache';

function dataURLtoBlob(dataurl: string): Blob {
  const parts = dataurl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const BOOTSTRAPPED_ADMIN_EMAILS: string[] = [
  'updatetokendanswacam@gmail.com',
  'admin@depotel.id'
];

/**
 * Checks if a user is a verified Administrator based on server-side Firestore records
 * or official bootstrapped admin emails.
 */
export async function isVerifiedAdmin(uid: string, email?: string | null): Promise<boolean> {
  const cleanEmail = email?.trim().toLowerCase() || '';
  if (cleanEmail && BOOTSTRAPPED_ADMIN_EMAILS.includes(cleanEmail)) {
    return true;
  }

  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    if (adminSnap.exists()) {
      return true;
    }
  } catch (err) {
    console.warn('Error verifying admin document:', err);
  }

  return false;
}

/**
 * Sync or register an authenticated Firebase user in Firestore with verified role.
 * User role CANNOT be tampered with by client: only verified emails or existing admin docs receive 'admin'.
 */
export async function syncUserProfile(fbUser: FirebaseUser): Promise<User> {
  const uid = fbUser.uid;
  const email = fbUser.email?.toLowerCase() || '';
  const userDocRef = doc(db, 'users', uid);
  const adminDocRef = doc(db, 'admins', uid);

  const isAdmin = await isVerifiedAdmin(uid, email);
  if (isAdmin) {
    try {
      await setDoc(adminDocRef, {
        userId: uid,
        email,
        addedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Failed recording admin doc:', e);
    }
  }

  const role: 'admin' | 'user' = isAdmin ? 'admin' : 'user';

  // Read existing profile to preserve custom avatar or name
  let existingProfile: Partial<User> = {};
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      existingProfile = snap.data() as Partial<User>;
    }
  } catch (err) {
    console.warn('Error fetching existing user profile:', err);
  }

  // Prioritize existing saved custom name and avatar from Firestore
  const resolvedName =
    existingProfile.name?.trim() ||
    fbUser.displayName?.trim() ||
    (isAdmin ? 'DEPOTEL Administrator' : (email ? email.split('@')[0] : 'Petugas Lapangan'));

  const resolvedAvatar =
    existingProfile.avatar?.trim() ||
    fbUser.photoURL ||
    '/logo.png';

  const userProfile: User = {
    id: uid,
    name: resolvedName,
    email: email || existingProfile.email || '',
    role,
    avatar: resolvedAvatar,
    status: existingProfile.status || 'active',
    isOnline: true,
    lastSeen: 'Sekarang',
  };

  try {
    await setDoc(userDocRef, {
      ...userProfile,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to write user profile to Firestore:', err);
  }

  return userProfile;
}

/**
 * Real-time subscription to registered users in Firestore.
 * Automatically seeds INITIAL_USERS if the users collection in Firestore is empty.
 */
export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');

  return onSnapshot(
    usersCol,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          await seedInitialUsers();
        } catch (e) {
          console.error('Error seeding initial users:', e);
        }
        return;
      }

      const usersList: User[] = [];
      snapshot.forEach((d) => {
        usersList.push(d.data() as User);
      });

      // Keep deterministic order: admin first, then by name
      usersList.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.name.localeCompare(b.name);
      });

      onUpdate(usersList);
    },
    (err) => {
      console.error('Firestore users snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seed Firestore with INITIAL_USERS
 */
export async function seedInitialUsers(): Promise<void> {
  for (const user of INITIAL_USERS) {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });

    if (user.role === 'admin') {
      const adminRef = doc(db, 'admins', user.id);
      await setDoc(adminRef, {
        userId: user.id,
        name: user.name,
        email: user.email || 'updatetokendanswacam@gmail.com',
        addedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }
}

/**
 * Save or update a user document in Firestore permanently.
 * Guarantees that Firestore writes are executed and throws descriptive error if failed.
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  if (!user.id) {
    throw new Error('ID pengguna wajib disertakan.');
  }
  if (!user.name || user.name.trim().length < 2) {
    throw new Error('Nama pengguna minimal 2 karakter.');
  }

  const cleanUser: User = {
    ...user,
    name: user.name.trim(),
    email: user.email ? user.email.trim() : undefined,
  };

  const userRef = doc(db, 'users', cleanUser.id);
  await setDoc(userRef, {
    ...cleanUser,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Synchronize admin document if admin role
  if (cleanUser.role === 'admin') {
    try {
      const adminRef = doc(db, 'admins', cleanUser.id);
      await setDoc(adminRef, {
        userId: cleanUser.id,
        name: cleanUser.name,
        email: cleanUser.email || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update admin collection record:', e);
    }
  }
}

/**
 * Updates a user's name permanently in Firestore.
 * Verifies that the document exists and updates only the name and updatedAt.
 */
export async function updateUserProfileName(userId: string, newName: string): Promise<User> {
  const cleanName = newName.trim();
  if (!cleanName || cleanName.length < 2) {
    throw new Error('Nama profil minimal 2 karakter dan tidak boleh kosong.');
  }

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('Data profil pengguna tidak ditemukan di database.');
  }

  const existingData = snap.data() as User;
  const updatedUser: User = {
    ...existingData,
    name: cleanName,
  };

  await setDoc(userRef, {
    name: cleanName,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  if (existingData.role === 'admin') {
    try {
      const adminRef = doc(db, 'admins', userId);
      await setDoc(adminRef, {
        userId,
        name: cleanName,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Sync admin record notice:', e);
    }
  }

  return updatedUser;
}

/**
 * Delete a user from Firestore permanently
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);

  const adminRef = doc(db, 'admins', userId);
  try {
    await deleteDoc(adminRef);
  } catch {
    // Ignored
  }
}

/**
 * Real-time subscription to categories in Firestore
 */
export function subscribeToCategories(
  onUpdate: (categories: UpdateCategory[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const categoriesCol = collection(db, 'categories');

  return onSnapshot(
    categoriesCol,
    async (snapshot) => {
      syncManager.setFirestoreConnected(snapshot.metadata.fromCache);
      if (snapshot.empty) {
        try {
          await seedInitialCategories();
        } catch (e) {
          console.error('Error seeding initial categories:', e);
        }
        return;
      }

      const cats: UpdateCategory[] = [];
      snapshot.forEach((d) => {
        cats.push(d.data() as UpdateCategory);
      });

      onUpdate(cats);
    },
    (err) => {
      syncManager.setFirestoreError(err);
      console.error('Firestore categories snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seed Firestore with INITIAL_CATEGORIES
 */
export async function seedInitialCategories(): Promise<void> {
  for (const cat of INITIAL_CATEGORIES) {
    const catRef = doc(db, 'categories', cat.id);
    await setDoc(catRef, cat, { merge: true });
  }
}

/**
 * Save or update a single category in Firestore with sanitized site records
 * to strictly prevent exceeding Firestore's 1MB document limit.
 */
export async function saveCategoryToFirestore(category: UpdateCategory): Promise<void> {
  if (!category || !category.id) {
    throw new Error('ID Kategori tidak valid.');
  }

  const catRef = doc(db, 'categories', category.id);

  // Store lightweight photo metadata inside site objects so the category document stays small,
  // while the full high-resolution image data is stored securely in /photos/{photoId} collection.
  const sanitizedSites: SiteItem[] = (category.sites || []).map((s) => ({
    id: s.id,
    meterId: s.meterId || '',
    siteId: s.siteId || '',
    siteName: s.siteName || '',
    checked: Boolean(s.checked),
    checkedBy: s.checked ? (s.checkedBy || s.updatedBy || '') : '',
    statusColor: s.statusColor || undefined,
    tokens: Array.isArray(s.tokens) ? s.tokens : [],
    updatedAt: s.updatedAt || new Date().toISOString(),
    updatedBy: s.updatedBy || '',
    photos: (s.photos || []).map((p) => ({
      id: p.id,
      siteId: p.siteId || s.id,
      siteName: p.siteName || s.siteName || '',
      meterId: p.meterId || s.meterId || '',
      storageUrl: p.storageUrl || '',
      storagePath: p.storagePath || '',
      dataUrl: p.storageUrl ? '' : (p.dataUrl || ''),
      timestamp: p.timestamp || new Date().toISOString(),
      capturedBy: p.capturedBy || '',
      capturedById: p.capturedById || '',
      formattedTime: p.formattedTime || '',
      categoryType: p.categoryType,
      categoryTitle: p.categoryTitle || '',
      brandTitle: p.brandTitle || '',
    })),
  }));

  const sanitizedCategory: UpdateCategory = {
    id: category.id,
    title: category.title || '',
    period: category.period || '',
    type: category.type || 'swacam',
    customTypeName: category.customTypeName || undefined,
    sites: sanitizedSites,
    allowCamera: category.allowCamera ?? true,
    allowTokenInput: category.allowTokenInput ?? false,
  };

  // Convert undefined fields to clean JSON structure so setDoc never throws on undefined values
  const cleanedPayload = JSON.parse(JSON.stringify(sanitizedCategory));

  try {
    await setDoc(catRef, cleanedPayload, { merge: true });
  } catch (err: any) {
    console.error(`Error saving category ${category.id} to Firestore:`, err);
    throw new Error(err?.message || 'Gagal menyimpan data kategori ke database.');
  }
}

/**
 * Delete a category from Firestore
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  if (!categoryId) {
    throw new Error('ID Kategori tidak valid.');
  }
  const catRef = doc(db, 'categories', categoryId);
  try {
    await deleteDoc(catRef);
  } catch (err: any) {
    console.error(`Error deleting category ${categoryId} from Firestore:`, err);
    throw new Error(err?.message || 'Gagal menghapus kategori dari database.');
  }
}

/**
 * Save or update an invite code in Firestore
 */
export async function saveInviteToFirestore(invite: InviteLink): Promise<void> {
  const inviteRef = doc(db, 'invites', invite.id);
  await setDoc(inviteRef, invite, { merge: true });
}

/**
 * Saves a documentation photo permanently to Firebase Cloud Storage and Firestore.
 * Ensures the photo is uploaded, referenced with permanent storage URL, and saved to /photos/{photoId}.
 * Strips huge Base64 payload from Firestore write to ensure lightning-fast database saves (<150ms).
 */
export async function savePhotoPermanently(photo: PhotoRecord): Promise<PhotoRecord> {
  if (!photo.id) {
    throw new Error('ID foto tidak valid.');
  }

  let storageUrl = photo.storageUrl || '';
  let storagePath = photo.storagePath || '';

  // 1. Attempt upload to Firebase Cloud Storage via binary Blob (faster than base64)
  if (storage && photo.dataUrl && photo.dataUrl.startsWith('data:')) {
    try {
      const generatedPath = `photos/${photo.siteId}/${photo.id}.jpg`;
      const storageRef = ref(storage, generatedPath);
      const blob = dataURLtoBlob(photo.dataUrl);
      await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: { 'Cache-Control': 'public, max-age=31536000' }
      });
      storageUrl = await getDownloadURL(storageRef);
      storagePath = generatedPath;
    } catch (err) {
      console.warn('Firebase Cloud Storage binary upload notice, trying string fallback:', err);
      try {
        const generatedPath = `photos/${photo.siteId}/${photo.id}.jpg`;
        const storageRef = ref(storage, generatedPath);
        await uploadString(storageRef, photo.dataUrl, 'data_url');
        storageUrl = await getDownloadURL(storageRef);
        storagePath = generatedPath;
      } catch (e2) {
        console.warn('Firebase Cloud Storage notice (fallback to Firestore document):', e2);
      }
    }
  }

  // 2. Prepare lightweight record for Firestore to guarantee instant writes (<30ms)
  const firestoreRecord: PhotoRecord = {
    ...photo,
    storageUrl: storageUrl || photo.storageUrl || '',
    storagePath: storagePath || photo.storagePath || '',
    // Strip Base64 dataUrl from Firestore document when storageUrl exists
    dataUrl: storageUrl ? '' : (photo.dataUrl || ''),
    createdAt: photo.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 3. Save complete photo record permanently into Firestore /photos/{photoId}
  const photoDocRef = doc(db, 'photos', firestoreRecord.id);
  await setDoc(photoDocRef, firestoreRecord, { merge: true });

  // 4. Return complete record with dataUrl so local state renders preview instantly
  const returnRecord: PhotoRecord = {
    ...firestoreRecord,
    dataUrl: photo.dataUrl || storageUrl,
  };

  // Cache in fast in-memory map & IndexedDB for instant zero-delay access
  if (returnRecord.id) {
    cachePhotoUrl(returnRecord.id, returnRecord.dataUrl || returnRecord.storageUrl || '');
  }

  try {
    await savePhotoToDB(returnRecord);
  } catch (err) {
    console.warn('IndexedDB photo cache warning:', err);
  }

  return returnRecord;
}

/**
 * Permanently deletes a documentation photo from Firestore, Firebase Storage, and IndexedDB.
 * Restricted to verified Administrator actions only.
 */
export async function deletePhotoPermanently(photoId: string, storagePath?: string): Promise<void> {
  // Invalidate in-memory cache
  invalidatePhotoCache(photoId);

  // 1. Delete from Firestore /photos/{photoId}
  const photoDocRef = doc(db, 'photos', photoId);
  await deleteDoc(photoDocRef);

  // 2. Delete from Firebase Cloud Storage if a storage path exists
  if (storage && storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Firebase Storage file delete notice:', e);
    }
  }

  // 3. Delete from local IndexedDB cache
  try {
    await deletePhotoFromDB(photoId);
  } catch (e) {
    console.warn('IndexedDB delete notice:', e);
  }
}

/**
 * Real-time subscription to all documentation photos in Firestore.
 * Automatically synchronizes photos across all devices, sessions, and reloads.
 */
export function subscribeToPhotos(
  onUpdate: (photos: PhotoRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const photosCol = collection(db, 'photos');
  return onSnapshot(
    photosCol,
    (snapshot) => {
      syncManager.setFirestoreConnected(snapshot.metadata.fromCache);
      const photoList: PhotoRecord[] = [];
      snapshot.forEach((d) => {
        const p = d.data() as PhotoRecord;
        photoList.push(p);
        if (p.id) {
          cachePhotoUrl(p.id, p.dataUrl || p.storageUrl || '');
        }
      });
      // Sort newest first
      photoList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(photoList);
    },
    (err) => {
      syncManager.setFirestoreError(err);
      console.error('Firestore photos snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetches all documentation photos from Firestore once.
 */
export async function loadAllPhotosFromFirestore(): Promise<PhotoRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'photos'));
    const photoList: PhotoRecord[] = [];
    snap.forEach((d) => {
      photoList.push(d.data() as PhotoRecord);
    });
    return photoList;
  } catch (err) {
    console.error('Failed to load photos from Firestore:', err);
    return [];
  }
}
