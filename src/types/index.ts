export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  lastSeen?: string;
  isOnline?: boolean;
}

export interface PhotoRecord {
  id: string;
  siteId: string;
  siteName: string;
  meterId: string;
  dataUrl: string;
  storageUrl?: string;
  storagePath?: string;
  timestamp: string; // ISO string
  capturedBy: string;
  capturedById?: string;
  categoryType?: 'token' | 'swacam' | 'token_manual' | 'custom';
  categoryTitle?: string;
  brandTitle?: string;
  formattedTime: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteItem {
  id: string;
  meterId: string; // No. ID Pelanggan / Meter
  siteId: string;  // Site ID (e.g. EPE134, JKT763, JTX376)
  siteName: string;// Nama Site
  checked: boolean;
  checkedBy?: string; // Nama petugas yang menceklis
  tokens?: string[]; // No Token Listrik (multiple tokens support)
  photos?: PhotoRecord[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateCategory {
  id: string;
  title: string;       // e.g. "Pengisian Token Listrik - DEPOTEL"
  period: string;      // e.g. "Bulan September 2026"
  type: 'token' | 'swacam' | 'token_manual' | 'custom';
  customTypeName?: string; // Tipe atau nama kategori kustom yang diketik pengguna
  sites: SiteItem[];
  allowCamera: boolean;
  allowTokenInput: boolean;
}

export interface InviteLink {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  role: UserRole;
  usedBy?: string[];
  active: boolean;
}

// ======================
// FITUR TOKEN & TRANSAKSI
// ======================
export interface TokenBalance {
  currentBalance: number; // Saldo token (KWh atau unit token)
  totalUsed: number;      // Total pemakaian token
  lowThreshold: number;   // Batas peringatan token menipis
  unit: string;           // 'KWh' atau 'Token'
  lastUpdated: string;    // ISO timestamp
}

export interface TokenPackage {
  id: string;
  name: string;
  tokenAmount: number;    // Jumlah token yang didapat (misal 50 kWh / 100 kWh)
  price: number;          // Harga dalam Rupiah (e.g. 50000, 100000)
  popular?: boolean;
  bonus?: number;
  description: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface TokenTransaction {
  id: string;
  referenceNumber: string; // TRX-202609-XXXX
  packageId?: string;
  packageName: string;
  tokenAmount: number;
  price: number;
  paymentMethod: string;
  paymentMethodCode: 'qris' | 'bca_va' | 'mandiri_va' | 'bri_va' | 'bank_transfer';
  status: TransactionStatus;
  createdAt: string;
  verifiedAt?: string;
  failedReason?: string;
  createdBy: string;
  isDemo: boolean;
}

// ======================
// FITUR MODUL SWACAM
// ======================
export type SwacamConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface SwacamConfig {
  isConnected: boolean;
  connectionStatus: SwacamConnectionStatus;
  apiUrl: string;
  apiKeyMasked: string;
  provider: string; // e.g., 'PLN SWACAM Gateway'
  syncIntervalMinutes: number;
  lastSyncTime?: string;
  lastSyncStatus?: 'success' | 'failed' | 'idle';
  totalReadings: number;
  successRate: number;
  autoSync: boolean;
  allowDisconnect: boolean;
}

export interface SwacamLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  event: string;
  message: string;
  siteId?: string;
}

// ======================
// FITUR PENGATURAN & TAMPILAN
// ======================
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'id' | 'en';
  notifications: boolean;
  emailAlerts: boolean;
  soundAlerts: boolean;
  tokenLowWarning: boolean;
}

export interface TokenSystemConfig {
  provider: string;
  endpointUrl: string;
  apiKeyMasked: string;
  tokenVersion: string;
  autoBatchSize: number;
  timeoutSeconds: number;
  environment: 'demo' | 'sandbox' | 'production';
  lastValidated?: string;
  isValidated: boolean;
}

// Navigation tabs: exclusively Beranda (Dashboard) & Pengaturan (Settings)
export type NavTab = 'dashboard' | 'settings';
