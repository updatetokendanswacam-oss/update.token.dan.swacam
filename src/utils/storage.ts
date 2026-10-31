import {
  User,
  UpdateCategory,
  SiteItem,
  PhotoRecord,
  InviteLink,
  TokenBalance,
  TokenTransaction,
  SwacamConfig,
  SwacamLog,
  AppSettings,
  TokenPackage,
  TokenSystemConfig
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_TOKEN_BALANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_SWACAM_CONFIG,
  INITIAL_SWACAM_LOGS,
  INITIAL_APP_SETTINGS,
  INITIAL_TOKEN_PACKAGES,
  INITIAL_TOKEN_CONFIG
} from './initialData';

const STORAGE_KEYS = {
  CATEGORIES: 'depotel_categories_v4',
  USERS: 'depotel_users_v2',
  SESSION: 'depotel_session_v2',
  INVITES: 'depotel_invites_v2',
  PHOTOS: 'depotel_photos_v2',
  REMEMBERED_ACCOUNT: 'depotel_remembered_account_v1',
  TOKEN_BALANCE: 'depotel_token_balance_v1',
  TRANSACTIONS: 'depotel_transactions_v1',
  SWACAM_CONFIG: 'depotel_swacam_config_v1',
  SWACAM_LOGS: 'depotel_swacam_logs_v1',
  APP_SETTINGS: 'depotel_app_settings_v1',
  TOKEN_CONFIG: 'depotel_token_config_v1',
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
      // Migrate from legacy v3 if available, restoring genuine saved state
      const legacyRaw = localStorage.getItem('depotel_categories_v3');
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const clean = parsedLegacy.map((cat: UpdateCategory) => ({
              ...cat,
              sites: cat.sites.map((site: SiteItem) => {
                const isInitialSite =
                  site.id.startsWith('s') ||
                  site.id.startsWith('t') ||
                  site.id.startsWith('m');
                return {
                  ...site,
                  checked: isInitialSite ? false : !!site.checked,
                };
              }),
            }));
            saveCategories(clean);
            return clean;
          }
        } catch {
          // ignore error
        }
      }
      saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    const deletedIds = loadDeletedCategoryIds();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id));
      saveCategories(initial);
      return initial;
    }
    const updated = parsed
      .filter((cat: UpdateCategory) => !deletedIds.has(cat.id))
      .map((cat: UpdateCategory) => {
        if (cat.id === 'cat-token-depotel' || cat.title.toLowerCase().includes('swfm')) {
          return { ...cat, allowCamera: true };
        }
        return cat;
      });
    return updated;
  } catch (e) {
    console.error('Error loading categories:', e);
    const deletedIds = loadDeletedCategoryIds();
    return INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id));
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

// ==========================================
// TOKEN BALANCE & USAGE PERSISTENCE
// ==========================================
export function loadTokenBalance(): TokenBalance {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOKEN_BALANCE);
    if (!raw) {
      saveTokenBalance(INITIAL_TOKEN_BALANCE);
      return INITIAL_TOKEN_BALANCE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading token balance:', e);
    return INITIAL_TOKEN_BALANCE;
  }
}

export function saveTokenBalance(balance: TokenBalance): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN_BALANCE, JSON.stringify(balance));
  } catch (e) {
    console.error('Error saving token balance:', e);
  }
}

export function loadTokenPackages(): TokenPackage[] {
  return INITIAL_TOKEN_PACKAGES;
}

// ==========================================
// TRANSAKSI PENGISIAN TOKEN PERSISTENCE
// ==========================================
export function loadTransactions(): TokenTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Error loading transactions:', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: TokenTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

export function addTransaction(transaction: TokenTransaction): TokenTransaction[] {
  const current = loadTransactions();
  // Prevent duplicate insertion by reference number
  if (current.some(t => t.referenceNumber === transaction.referenceNumber)) {
    return current;
  }
  const updated = [transaction, ...current];
  saveTransactions(updated);
  return updated;
}

export function updateTransactionStatus(
  trxId: string,
  status: 'pending' | 'success' | 'failed' | 'cancelled',
  options?: { failedReason?: string; verifiedAt?: string }
): { transactions: TokenTransaction[]; updatedTrx?: TokenTransaction } {
  const current = loadTransactions();
  let updatedTrx: TokenTransaction | undefined;

  const updated = current.map(t => {
    if (t.id === trxId) {
      updatedTrx = {
        ...t,
        status,
        verifiedAt: status === 'success' ? (options?.verifiedAt || new Date().toISOString()) : t.verifiedAt,
        failedReason: options?.failedReason || t.failedReason
      };
      return updatedTrx;
    }
    return t;
  });

  saveTransactions(updated);
  return { transactions: updated, updatedTrx };
}

// ==========================================
// SWACAM CONFIG & LOGS PERSISTENCE
// ==========================================
export function loadSwacamConfig(): SwacamConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SWACAM_CONFIG);
    if (!raw) {
      saveSwacamConfig(INITIAL_SWACAM_CONFIG);
      return INITIAL_SWACAM_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading SWACAM config:', e);
    return INITIAL_SWACAM_CONFIG;
  }
}

export function saveSwacamConfig(config: SwacamConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SWACAM_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving SWACAM config:', e);
  }
}

export function loadSwacamLogs(): SwacamLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SWACAM_LOGS);
    if (!raw) {
      saveSwacamLogs(INITIAL_SWACAM_LOGS);
      return INITIAL_SWACAM_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SWACAM_LOGS;
  } catch (e) {
    console.error('Error loading SWACAM logs:', e);
    return INITIAL_SWACAM_LOGS;
  }
}

export function saveSwacamLogs(logs: SwacamLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SWACAM_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving SWACAM logs:', e);
  }
}

export function addSwacamLog(log: Omit<SwacamLog, 'id' | 'timestamp'>): SwacamLog[] {
  const current = loadSwacamLogs();
  const newLog: SwacamLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newLog, ...current].slice(0, 50); // keep last 50
  saveSwacamLogs(updated);
  return updated;
}

// ==========================================
// APP SETTINGS PERSISTENCE
// ==========================================
export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!raw) {
      saveAppSettings(INITIAL_APP_SETTINGS);
      return INITIAL_APP_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading app settings:', e);
    return INITIAL_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving app settings:', e);
  }
}

// ==========================================
// TOKEN SYSTEM CONFIG PERSISTENCE
// ==========================================
export function loadTokenConfig(): TokenSystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOKEN_CONFIG);
    if (!raw) {
      saveTokenConfig(INITIAL_TOKEN_CONFIG);
      return INITIAL_TOKEN_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading token config:', e);
    return INITIAL_TOKEN_CONFIG;
  }
}

export function saveTokenConfig(config: TokenSystemConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving token config:', e);
  }
}

// ==========================================
// NAME-BASED TYPED LOGIN PERSISTENCE (3x auto-save)
// ==========================================
const LOGIN_COUNTS_KEY = 'depotel_login_counts_v1';
const SAVED_OFFICERS_KEY = 'depotel_saved_officers_v1';

export function getLoginCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOGIN_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getNameLoginCount(name: string): number {
  if (!name || !name.trim()) return 0;
  const counts = getLoginCounts();
  return counts[name.trim().toLowerCase()] || 0;
}

export function recordNameLogin(name: string): { count: number; isSaved: boolean; wasAlreadySaved: boolean } {
  const cleanName = name.trim();
  const normalizedKey = cleanName.toLowerCase();
  const counts = getLoginCounts();
  const previousCount = counts[normalizedKey] || 0;
  const newCount = previousCount + 1;
  counts[normalizedKey] = newCount;

  try {
    localStorage.setItem(LOGIN_COUNTS_KEY, JSON.stringify(counts));
  } catch {}

  const saved = getSavedOfficerNames();
  const wasAlreadySaved = saved.some((n) => n.toLowerCase() === normalizedKey);
  const isSaved = newCount >= 3;

  if (isSaved && !wasAlreadySaved) {
    saved.push(cleanName);
    try {
      localStorage.setItem(SAVED_OFFICERS_KEY, JSON.stringify(saved));
    } catch {}
  }

  return { count: newCount, isSaved, wasAlreadySaved };
}

export function getSavedOfficerNames(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_OFFICERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Persistent Deleted Category Tracker to permanently prevent list resurrection
const DELETED_CATEGORY_IDS_KEY = 'depotel_deleted_category_ids_v1';

export function loadDeletedCategoryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_CATEGORY_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDeletedCategoryIds(deletedIds: Set<string>): void {
  try {
    localStorage.setItem(DELETED_CATEGORY_IDS_KEY, JSON.stringify(Array.from(deletedIds)));
  } catch (e) {
    console.error('Error saving deleted category ids:', e);
  }
}

