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
  timestamp: string; // ISO string
  capturedBy: string;
  formattedTime: string;
}

export interface SiteItem {
  id: string;
  meterId: string; // No. ID Pelanggan / Meter
  siteId: string;  // Site ID (e.g. EPE134, JKT763, JTX376)
  siteName: string;// Nama Site
  checked: boolean;
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
