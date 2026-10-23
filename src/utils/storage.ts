import { User, UpdateCategory, PhotoRecord, InviteLink } from '../types';
import { INITIAL_USERS, INITIAL_CATEGORIES } from './initialData';

const STORAGE_KEYS = {
  CATEGORIES: 'depotel_categories_v3',
  USERS: 'depotel_users_v2',
  SESSION: 'depotel_session_v2',
  INVITES: 'depotel_invites_v2',
  PHOTOS: 'depotel_photos_v2',
  REMEMBERED_ACCOUNT: 'depotel_remembered_account_v1'
};

// IndexedDB Helper for permanent, unexpired photo storage
const DB_NAME = 'DepotelPhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('siteId', 'siteId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoToDB(photo: PhotoRecord): Promise<void> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to localStorage for photo:', err);
    const existing = getPhotosFromLocal();
    const updated = [photo, ...existing.filter(p => p.id !== photo.id)];
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updated));
  }
}

export async function getPhotosForSite(siteId: string): Promise<PhotoRecord[]> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: PhotoRecord[] = req.result || [];
        resolve(all.filter(p => p.siteId === siteId));
      };
      req.onerror = () => {
        resolve(getPhotosFromLocal().filter(p => p.siteId === siteId));
      };
    });
  } catch {
    return getPhotosFromLocal().filter(p => p.siteId === siteId);
  }
}

export async function deletePhotoFromDB(photoId: string): Promise<void> {
  try {
    const db = await openPhotoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(photoId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
  const existing = getPhotosFromLocal();
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(existing.filter(p => p.id !== photoId)));
}

function getPhotosFromLocal(): PhotoRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Categories Management
export function loadCategories(): UpdateCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading categories:', e);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: UpdateCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories:', e);
  }
}

// Users Management
export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading users:', e);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

// Session & Remembered Account Management
export function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) return JSON.parse(raw);
    // If no active session, check if there is a remembered user on this device
    const remembered = loadRememberedUser();
    if (remembered) return remembered;
    return null;
  } catch (e) {
    console.error('Error loading session:', e);
    return null;
  }
}

export function saveSession(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    // Also save as permanently remembered user on this device
    saveRememberedUser(user);
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

export function clearSession(clearRemembered: boolean = false): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    if (clearRemembered) {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_ACCOUNT);
    }
  } catch (e) {
    console.error('Error clearing session:', e);
  }
}

export function loadRememberedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMEMBERED_ACCOUNT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading remembered user:', e);
    return null;
  }
}

export function saveRememberedUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_ACCOUNT, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving remembered user:', e);
  }
}

export function clearRememberedUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_ACCOUNT);
  } catch (e) {
    console.error('Error clearing remembered user:', e);
  }
}

// Invites Management
export function loadInvites(): InviteLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInvites(invites: InviteLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
  } catch (e) {
    console.error('Error saving invites:', e);
  }
}
