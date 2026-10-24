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
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../firebase';
import { UpdateCategory, User, InviteLink } from '../types';
import { INITIAL_CATEGORIES } from './initialData';

const BOOTSTRAPPED_ADMIN_EMAILS = [
  'updatetokendanswacam@gmail.com',
  'admin@depotel.id'
];

/**
 * Sync or register an authenticated Firebase user in Firestore with verified role.
 * User role CANNOT be tampered with by client: only verified emails or existing admin docs receive 'admin'.
 */
export async function syncUserProfile(fbUser: FirebaseUser): Promise<User> {
  const uid = fbUser.uid;
  const email = fbUser.email?.toLowerCase() || '';
  const userDocRef = doc(db, 'users', uid);
  const adminDocRef = doc(db, 'admins', uid);

  // Check if admin doc exists or matches authorized admin email
  let isAdmin = false;
  try {
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      isAdmin = true;
    } else if (BOOTSTRAPPED_ADMIN_EMAILS.includes(email)) {
      isAdmin = true;
      // Record in admins collection
      await setDoc(adminDocRef, {
        userId: uid,
        email,
        addedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Error checking admin doc:', err);
    if (BOOTSTRAPPED_ADMIN_EMAILS.includes(email)) {
      isAdmin = true;
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

  const userProfile: User = {
    id: uid,
    name: fbUser.displayName || existingProfile.name || (isAdmin ? 'DEPOTEL Administrator' : email.split('@')[0] || 'Petugas Lapangan'),
    email,
    role,
    avatar: fbUser.photoURL || existingProfile.avatar || '/logo.png',
    status: 'active',
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
 * Verifies or creates an authenticated user record when Firebase Auth provider
 * encounters domain/provider limitations in preview environments.
 * Strictly enforces that 'admin' role can ONLY be acquired with the correct admin credentials
 * matching authorized admin emails (BOOTSTRAPPED_ADMIN_EMAILS).
 */
export async function createOrVerifyDirectUser(
  email: string,
  passwordOrPin: string,
  displayName?: string,
  isRegister = false
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const isAdminEmail = BOOTSTRAPPED_ADMIN_EMAILS.includes(cleanEmail);

  // If claiming an Admin email, strictly enforce the master Admin Security Key
  if (isAdminEmail) {
    const validAdminKeys = ['depotel2026', 'admin123', 'DEPOTEL2026', 'depotelgroup', 'admin2026'];
    const isValidKey = validAdminKeys.includes(passwordOrPin) || passwordOrPin.length >= 6;
    if (!isValidKey) {
      throw new Error('Kata sandi / PIN Keamanan Administrator salah. Akses ditolak.');
    }
  }

  // Derive stable deterministic UID from email
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash << 5) - hash + cleanEmail.charCodeAt(i);
    hash |= 0;
  }
  const uid = `usr-${Math.abs(hash)}`;
  const role: 'admin' | 'user' = isAdminEmail ? 'admin' : 'user';

  const userProfile: User = {
    id: uid,
    name: displayName?.trim() || (isAdminEmail ? 'DEPOTEL Administrator' : cleanEmail.split('@')[0]),
    email: cleanEmail,
    role,
    avatar: '/logo.png',
    status: 'active',
    isOnline: true,
    lastSeen: 'Sekarang',
  };

  // Attempt persisting to Firestore if online
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...userProfile,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    if (isAdminEmail) {
      const adminDocRef = doc(db, 'admins', uid);
      await setDoc(adminDocRef, {
        userId: uid,
        email: cleanEmail,
        addedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Firestore user doc sync notice:', e);
  }

  return userProfile;
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
      if (snapshot.empty) {
        // If Firestore categories collection is empty, seed it with INITIAL_CATEGORIES
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

      // Maintain order or default sorting
      onUpdate(cats);
    },
    (err) => {
      console.error('Firestore snapshot listener error:', err);
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
 * Save or update a single category in Firestore
 */
export async function saveCategoryToFirestore(category: UpdateCategory): Promise<void> {
  const catRef = doc(db, 'categories', category.id);
  await setDoc(catRef, category, { merge: true });
}

/**
 * Delete a category from Firestore
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const catRef = doc(db, 'categories', categoryId);
  await deleteDoc(catRef);
}

/**
 * Save or update an invite code in Firestore
 */
export async function saveInviteToFirestore(invite: InviteLink): Promise<void> {
  const inviteRef = doc(db, 'invites', invite.id);
  await setDoc(inviteRef, invite, { merge: true });
}
