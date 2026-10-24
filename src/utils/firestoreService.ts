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
import { INITIAL_CATEGORIES, INITIAL_USERS } from './initialData';

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
 * Save or update a user document in Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.id);
  await setDoc(userRef, user, { merge: true });

  const adminRef = doc(db, 'admins', user.id);
  if (user.role === 'admin') {
    await setDoc(adminRef, {
      userId: user.id,
      name: user.name,
      email: user.email || '',
      addedAt: new Date().toISOString(),
    }, { merge: true });
  } else {
    try {
      await deleteDoc(adminRef);
    } catch {
      // Ignored if wasn't admin
    }
  }
}

/**
 * Delete a user from Firestore
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
