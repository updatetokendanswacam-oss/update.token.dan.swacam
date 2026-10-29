import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadCategories,
  saveCategories,
  loadUsers,
  saveUsers,
  loadSession,
  saveSession,
  clearSession,
  loadInvites,
  saveInvites,
  savePhotoToDB,
  deletePhotoFromDB,
  recordNameLogin,
} from './utils/storage';
import {
  User,
  UpdateCategory,
  SiteItem,
  PhotoRecord,
  UserRole,
  InviteLink,
} from './types';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  syncUserProfile,
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveInviteToFirestore,
  subscribeToUsers,
  saveUserToFirestore,
  deleteUserFromFirestore,
  isVerifiedAdmin,
  BOOTSTRAPPED_ADMIN_EMAILS,
  savePhotoPermanently,
  deletePhotoPermanently,
  subscribeToPhotos,
  loadAllPhotosFromFirestore,
} from './utils/firestoreService';
import { INITIAL_CATEGORIES, INITIAL_USERS } from './utils/initialData';
import { savePhotoToPhoneGallery } from './utils/galleryService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OfflineBanner } from './components/OfflineBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import { PullToRefresh } from './components/PullToRefresh';
import { Home, Settings, RefreshCw, X } from 'lucide-react';

// Code-split heavy modals with React.lazy
const CameraModal = React.lazy(() => import('./components/CameraModal').then((m) => ({ default: m.CameraModal })));
const PhotoGalleryModal = React.lazy(() => import('./components/PhotoGalleryModal').then((m) => ({ default: m.PhotoGalleryModal })));
const EditSiteModal = React.lazy(() => import('./components/EditSiteModal').then((m) => ({ default: m.EditSiteModal })));
const AddSiteModal = React.lazy(() => import('./components/AddSiteModal').then((m) => ({ default: m.AddSiteModal })));
const AddCategoryModal = React.lazy(() => import('./components/AddCategoryModal').then((m) => ({ default: m.AddCategoryModal })));
const WhatsAppModal = React.lazy(() => import('./components/WhatsAppModal').then((m) => ({ default: m.WhatsAppModal })));
const ExportModal = React.lazy(() => import('./components/ExportModal').then((m) => ({ default: m.ExportModal })));
const UserManagementModal = React.lazy(() => import('./components/UserManagementModal').then((m) => ({ default: m.UserManagementModal })));
const AccountSettingsModal = React.lazy(() => import('./components/AccountSettingsModal').then((m) => ({ default: m.AccountSettingsModal })));
const InviteModal = React.lazy(() => import('./components/InviteModal').then((m) => ({ default: m.InviteModal })));
const ConfirmDeleteModal = React.lazy(() => import('./components/ConfirmDeleteModal').then((m) => ({ default: m.ConfirmDeleteModal })));
const EditCategoryModal = React.lazy(() => import('./components/EditCategoryModal').then((m) => ({ default: m.EditCategoryModal })));
const GoogleDriveModal = React.lazy(() => import('./components/GoogleDriveModal').then((m) => ({ default: m.GoogleDriveModal })));

export default function App() {
  // Core Operational States
  const [categories, setCategories] = useState<UpdateCategory[]>(() => loadCategories());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadSession());
  const [invites, setInvites] = useState<InviteLink[]>(() => loadInvites());

  // Navigation tab: 'dashboard' (Beranda) | 'settings' (Pengaturan)
  const [activeNav, setActiveNav] = useState<'dashboard' | 'settings'>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // View state within site monitoring: 'overview' or 'detail' (Persisted across page reloads & refreshes)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('depotel_active_view_mode');
      if (savedView === 'detail' || savedView === 'overview') {
        return savedView;
      }
    }
    return 'overview';
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedCat = localStorage.getItem('depotel_selected_category_id');
      if (savedCat) {
        return savedCat;
      }
    }
    const cats = loadCategories();
    return cats[0]?.id || 'cat-token-manual';
  });

  // Save navigation view state when user toggles categories or views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('depotel_active_view_mode', viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('depotel_selected_category_id', selectedCategoryId);
    }
  }, [selectedCategoryId]);

  // Modals state
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);

  // Edit Category state
  const [editingCategory, setEditingCategory] = useState<UpdateCategory | null>(null);

  // Site Actions
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null);
  const [cameraSite, setCameraSite] = useState<SiteItem | null>(null);
  const [cameraCategory, setCameraCategory] = useState<UpdateCategory | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ site: SiteItem; index: number } | null>(null);
  const [allPhotos, setAllPhotos] = useState<PhotoRecord[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    type: 'site' | 'category';
    site?: SiteItem;
    category?: UpdateCategory;
  } | null>(null);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Invite code detection in URL
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string | null>(null);

  // Real-time Service Worker update detection for smooth Vercel deployments
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    const t = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Real-time synchronization of authenticated Firebase user and verified role
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const email = fbUser.email?.toLowerCase() || '';
          const isAdmin = await isVerifiedAdmin(fbUser.uid, email);
          if (isAdmin) {
            const verifiedUser = await syncUserProfile(fbUser);
            setCurrentUser(verifiedUser);
            saveSession(verifiedUser);
          }
        } catch (err) {
          console.error('Error synchronizing auth user profile:', err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Real-time subscription to registered users in Firestore
  useEffect(() => {
    const unsubscribeUsers = subscribeToUsers((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
        saveUsers(remoteUsers);

        // Security & Profile Sync: Validate active session against latest user database
        const activeSession = loadSession();
        if (activeSession) {
          const found = remoteUsers.find((u) => u.id === activeSession.id) ||
            remoteUsers.find((u) => u.name.toLowerCase() === activeSession.name.toLowerCase());

          if (!found || found.status === 'inactive') {
            clearSession();
            setCurrentUser(null);
            showToast('Sesi berakhir: Akun Anda telah dinonaktifkan atau dihapus oleh Administrator.');
          } else {
            // Keep active session in sync if name, role, avatar were modified
            if (found.name !== activeSession.name || found.role !== activeSession.role || found.avatar !== activeSession.avatar) {
              const updated = { ...activeSession, name: found.name, role: found.role, avatar: found.avatar };
              setCurrentUser(updated);
              saveSession(updated);
            }
          }
        }
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, [showToast]);

  // Real-time subscription to persistent Firestore categories (Survives refresh & reconnects)
  useEffect(() => {
    const unsubscribeCats = subscribeToCategories((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        // Automatically ensure allowCamera is true for SWFM Token list
        const fixedCats = remoteCats.map((cat) => {
          if ((cat.id === 'cat-token-depotel' || cat.title.toLowerCase().includes('swfm')) && !cat.allowCamera) {
            const updatedCat = { ...cat, allowCamera: true };
            saveCategoryToFirestore(updatedCat).catch(() => {});
            return updatedCat;
          }
          return cat;
        });

        setCategories((prevCategories) => {
          const merged = fixedCats.map((remoteCat) => {
            const localCat = prevCategories.find((c) => c.id === remoteCat.id);
            if (!localCat) return remoteCat;

            const mergedSites = remoteCat.sites.map((remoteSite) => {
              const localSite = localCat.sites.find((s) => s.id === remoteSite.id);
              if (!localSite) return remoteSite;

              const remoteTime = remoteSite.updatedAt ? new Date(remoteSite.updatedAt).getTime() : 0;
              const localTime = localSite.updatedAt ? new Date(localSite.updatedAt).getTime() : 0;

              // Preserve local status if local edit timestamp is newer
              const useLocalStatus = localTime > remoteTime;
              const finalChecked = useLocalStatus ? localSite.checked : remoteSite.checked;
              const finalCheckedBy = useLocalStatus
                ? localSite.checkedBy
                : (remoteSite.checked ? remoteSite.checkedBy : '');
              const finalUpdatedAt = useLocalStatus ? localSite.updatedAt : remoteSite.updatedAt;
              const finalUpdatedBy = useLocalStatus ? localSite.updatedBy : remoteSite.updatedBy;

              const finalSiteId = useLocalStatus ? (localSite.siteId || remoteSite.siteId) : (remoteSite.siteId || localSite.siteId);
              const finalSiteName = useLocalStatus ? (localSite.siteName || remoteSite.siteName) : (remoteSite.siteName || localSite.siteName);
              const finalMeterId = useLocalStatus ? (localSite.meterId || remoteSite.meterId) : (remoteSite.meterId || localSite.meterId);
              const finalTokens = useLocalStatus ? (localSite.tokens || remoteSite.tokens || []) : (remoteSite.tokens || localSite.tokens || []);

              const localPhotos = localSite.photos || [];
              const remotePhotos = remoteSite.photos || [];

              const photoMap = new Map<string, PhotoRecord>();

              // Put remote photos first
              for (const rp of remotePhotos) {
                photoMap.set(rp.id, rp);
              }

              // Merge local photos so dataUrl and storageUrl are preserved
              for (const lp of localPhotos) {
                const existing = photoMap.get(lp.id);
                if (!existing) {
                  photoMap.set(lp.id, lp);
                } else {
                  photoMap.set(lp.id, {
                    ...existing,
                    dataUrl: existing.dataUrl || lp.dataUrl,
                    storageUrl: existing.storageUrl || lp.storageUrl,
                  });
                }
              }

              return {
                ...remoteSite,
                siteId: finalSiteId,
                siteName: finalSiteName,
                meterId: finalMeterId,
                tokens: finalTokens,
                checked: finalChecked,
                checkedBy: finalCheckedBy,
                updatedAt: finalUpdatedAt,
                updatedBy: finalUpdatedBy,
                photos: Array.from(photoMap.values()),
              };
            });

            return {
              ...remoteCat,
              sites: mergedSites,
            };
          });

          // Retain any newly added local categories not yet returned by remoteCats snapshot
          for (const localCat of prevCategories) {
            if (!merged.some((c) => c.id === localCat.id)) {
              merged.push(localCat);
            }
          }

          saveCategories(merged);
          return merged;
        });
      }
    });

    return () => {
      unsubscribeCats();
    };
  }, []);

  // Real-time subscription to permanent documentation photos in Firestore
  useEffect(() => {
    const unsubscribePhotos = subscribeToPhotos((remotePhotos) => {
      if (remotePhotos) {
        setAllPhotos(remotePhotos);
      }
    });

    return () => {
      unsubscribePhotos();
    };
  }, []);

  // Hydrate & synchronize permanent cloud photos into category sites
  useEffect(() => {
    if (allPhotos.length === 0) return;

    setCategories((prevCategories) => {
      let changed = false;
      const updated = prevCategories.map((cat) => {
        const updatedSites = cat.sites.map((site) => {
          const siteCloudPhotos = allPhotos.filter((p) => p.siteId === site.id);
          if (siteCloudPhotos.length === 0) return site;

          const existingPhotoMap = new Map((site.photos || []).map((p) => [p.id, p]));
          let siteChanged = false;

          const mergedPhotos: PhotoRecord[] = siteCloudPhotos.map((cloudPhoto) => {
            const existing = existingPhotoMap.get(cloudPhoto.id);
            if (!existing) {
              siteChanged = true;
              return cloudPhoto;
            }
            if ((!existing.dataUrl && cloudPhoto.dataUrl) || (!existing.storageUrl && cloudPhoto.storageUrl)) {
              siteChanged = true;
              return {
                ...existing,
                dataUrl: cloudPhoto.dataUrl || existing.dataUrl,
                storageUrl: cloudPhoto.storageUrl || existing.storageUrl,
              };
            }
            return existing;
          });

          // Retain any pending local photos not yet emitted by snapshot
          for (const localPhoto of site.photos || []) {
            if (!siteCloudPhotos.some((cp) => cp.id === localPhoto.id)) {
              mergedPhotos.push(localPhoto);
            }
          }

          if (siteChanged || mergedPhotos.length !== (site.photos || []).length) {
            changed = true;
            return {
              ...site,
              photos: mergedPhotos,
            };
          }
          return site;
        });

        return { ...cat, sites: updatedSites };
      });

      return changed ? updated : prevCategories;
    });
  }, [allPhotos]);

  // Debounced persistence to eliminate UI blocking on frequent updates
  useEffect(() => {
    const t = setTimeout(() => {
      saveCategories(categories);
    }, 250);
    return () => clearTimeout(t);
  }, [categories]);

  useEffect(() => {
    const t = setTimeout(() => {
      saveUsers(users);
    }, 250);
    return () => clearTimeout(t);
  }, [users]);

  useEffect(() => {
    const t = setTimeout(() => {
      saveInvites(invites);
    }, 250);
    return () => clearTimeout(t);
  }, [invites]);

  const checkForAppUpdate = useCallback(async (manual = false) => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (manual) setIsCheckingUpdate(true);
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting || reg.installing) {
            setHasUpdateAvailable(true);
            if (manual) showToast('Versi baru ditemukan dan siap diterapkan!');
          } else if (manual) {
            showToast('Aplikasi sudah menggunakan versi terbaru dari Vercel');
          }
        } else if (manual) {
          showToast('Aplikasi berjalan dengan versi terbaru');
        }
      } catch (err) {
        console.warn('Update check error:', err);
        if (manual) showToast('Gagal memeriksa pembaruan: Periksa koneksi internet');
      } finally {
        if (manual) setIsCheckingUpdate(false);
      }
    } else if (manual) {
      showToast('Browser tidak mendukung Service Worker');
    }
  }, [showToast]);

  const handleApplyUpdate = useCallback(async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          if (r.waiting) {
            r.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (e) {
        console.warn('Skip waiting error:', e);
      }
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        // Auto-check on initialization
        reg.update().catch(() => {});

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdateAvailable(true);
            }
          });
        });
      });

      // Check on tab focus / visibility
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkForAppUpdate(false);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [checkForAppUpdate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const remotePhotos = await loadAllPhotosFromFirestore();
      if (remotePhotos && remotePhotos.length > 0) {
        setAllPhotos(remotePhotos);
      }
    } catch (err) {
      console.warn('Refresh photo sync notice:', err);
    }
    setCategories(loadCategories());
    setUsers(loadUsers());
    setIsRefreshing(false);
    showToast('Data & foto berhasil diperbarui');
  };

  // Find currently open category (memoized)
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || categories[0],
    [categories, selectedCategoryId]
  );

  // Registered User Authentication (Hanya akun terdaftar & aktif yang diizinkan masuk)
  const handleRegisteredUserLogin = (user: User) => {
    setLoginErrorMessage(null);

    const matched = users.find((u) => u.id === user.id && u.status === 'active');
    if (!matched) {
      const msg = 'Akun Anda belum terdaftar. Silakan hubungi Administrator untuk mendapatkan akses.';
      setLoginErrorMessage(msg);
      showToast(msg);
      return;
    }

    if (matched.role === 'admin') {
      const msg = 'Akses ditolak. Fitur ini hanya dapat digunakan oleh Administrator. Silakan masuk melalui tombol Masuk Cepat Administrator (Google).';
      setLoginErrorMessage(msg);
      showToast(msg);
      return;
    }

    setCurrentUser(matched);
    saveSession(matched);
    showToast(`Selamat datang, ${matched.name}!`);
  };

  // Google Administrator Authentication (Khusus Administrator Terverifikasi)
  const handleGoogleAdminSignIn = async () => {
    setLoginErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email?.toLowerCase() || '';

      // Verify that this Google account is officially authorized as Administrator
      const isAdmin = await isVerifiedAdmin(fbUser.uid, email);

      if (!isAdmin) {
        await signOut(auth);
        const msg = 'Akses ditolak. Fitur ini hanya dapat digunakan oleh Administrator.';
        setLoginErrorMessage(msg);
        showToast(msg);
        throw new Error(msg);
      }

      const verifiedAdmin = await syncUserProfile(fbUser);
      setCurrentUser(verifiedAdmin);
      saveSession(verifiedAdmin);
      showToast(`Selamat datang, Administrator ${verifiedAdmin.name}!`);
    } catch (err: any) {
      console.warn('Google Admin authentication notice:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setLoginErrorMessage('Login Google dibatalkan.');
      } else if (!err?.message?.includes('Akses ditolak')) {
        setLoginErrorMessage('Gagal autentikasi Administrator. Pastikan menggunakan akun Google Administrator yang sah.');
      }
      throw err;
    }
  };

  const handleSelectUser = (user: User) => {
    if (user.status !== 'active') {
      showToast('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator untuk mendapatkan akses.');
      return;
    }
    if (user.role === 'admin') {
      showToast('Akses ditolak. Fitur ini hanya dapat digunakan oleh Administrator.');
      return;
    }
    setCurrentUser(user);
    saveSession(user);
    showToast(`Masuk sebagai ${user.name}`);
  };

  const handleRegisterFromInvite = (name: string, role: UserRole, inviteCode?: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      role,
      avatar: '/logo.png',
      status: 'active',
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    saveUserToFirestore(newUser).catch((err) => console.error('Error saving user to Firestore:', err));

    if (inviteCode) {
      const updatedInvites = invites.map((inv) => {
        if (inv.code === inviteCode) {
          const used = inv.usedBy || [];
          return { ...inv, usedBy: [...used, newUser.name] };
        }
        return inv;
      });
      setInvites(updatedInvites);
    }

    setCurrentUser(newUser);
    saveSession(newUser);
    setInviteCodeFromUrl(null);

    // Clean up url param
    if (window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      window.history.replaceState({}, document.title, url.toString());
    }

    showToast(`Selamat datang, ${newUser.name}!`);
  };

  const handleLogout = async (forgetDevice = false) => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    clearSession();
    setCurrentUser(null);
    setShowAccountSettings(false);
    if (forgetDevice) {
      showToast('Berhasil keluar dan data perangkat dibersihkan');
    } else {
      showToast('Berhasil keluar');
    }
  };

  // Category & Site Navigation
  const handleOpenCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToOverview = useCallback(() => {
    setViewMode('overview');
  }, []);

  // Helper to find a site by ID across all categories
  const findSiteGlobally = (siteId: string, currentCats: UpdateCategory[]): SiteItem | undefined => {
    for (const cat of currentCats) {
      const found = cat.sites.find((s) => s.id === siteId);
      if (found) return found;
    }
    return undefined;
  };

  // Helper to update a site across all categories (matching by id, siteId, or meterId)
  const updateSiteGlobally = (
    currentCats: UpdateCategory[],
    targetSiteId: string,
    updater: (site: SiteItem) => SiteItem
  ): UpdateCategory[] => {
    const refSite = findSiteGlobally(targetSiteId, currentCats);
    const refCode = refSite?.siteId?.trim().toLowerCase();
    const refMeter = refSite?.meterId?.trim();

    return currentCats.map((cat) => ({
      ...cat,
      sites: cat.sites.map((site) => {
        const isExactMatch = site.id === targetSiteId;
        const isSameSiteCode = Boolean(
          refCode &&
            refCode !== '' &&
            ((site.siteId && site.siteId.trim().toLowerCase() === refCode) ||
              (site.siteName && site.siteName.toLowerCase().includes(refCode)))
        );
        const isSameMeter = Boolean(
          refMeter &&
            refMeter !== '' &&
            refMeter !== '-' &&
            site.meterId &&
            site.meterId === refMeter
        );

        if (isExactMatch || isSameSiteCode || isSameMeter) {
          return updater(site);
        }
        return site;
      }),
    }));
  };

  // Site Check/Uncheck action (Mengubah status site yang diklik dan sinkronisasi ke seluruh kategori serta database)
  const handleToggleCheck = useCallback((targetSiteId: string) => {
    setCategories((prevCategories) => {
      const refSite = findSiteGlobally(targetSiteId, prevCategories);
      if (!refSite) return prevCategories;

      const newCheckedStatus = !refSite.checked;
      const userName = currentUser?.name || 'Petugas';
      const nowIso = new Date().toISOString();

      const refCode = refSite.siteId?.trim().toLowerCase();
      const refMeter = refSite.meterId?.trim();
      const affectedCatIds = new Set<string>();

      const updated = prevCategories.map((cat) => {
        let modified = false;
        const sites = cat.sites.map((site) => {
          const isExactMatch = site.id === targetSiteId;
          const isSameSiteCode = Boolean(
            refCode &&
              refCode !== '' &&
              ((site.siteId && site.siteId.trim().toLowerCase() === refCode) ||
                (site.siteName && site.siteName.toLowerCase().includes(refCode)))
          );
          const isSameMeter = Boolean(
            refMeter &&
              refMeter !== '' &&
              refMeter !== '-' &&
              site.meterId &&
              site.meterId === refMeter
          );

          if (isExactMatch || isSameSiteCode || isSameMeter) {
            modified = true;
            return {
              ...site,
              checked: newCheckedStatus,
              checkedBy: newCheckedStatus ? userName : '',
              updatedAt: nowIso,
              updatedBy: userName,
            };
          }
          return site;
        });

        if (modified) {
          affectedCatIds.add(cat.id);
        }

        return { ...cat, sites };
      });

      saveCategories(updated);

      // Non-blocking async background sync to Firestore
      setTimeout(() => {
        const affectedCategories = updated.filter((c) => affectedCatIds.has(c.id));
        for (const cat of affectedCategories) {
          saveCategoryToFirestore(cat).catch((err) =>
            console.warn('Firestore toggle check sync notice:', err)
          );
        }
      }, 0);

      return updated;
    });
  }, [currentUser?.name]);

  // Token Management (Memperbarui nomor token tanpa mengubah status centang secara otomatis)
  const handleAddToken = useCallback((siteId: string, token: string) => {
    setCategories((prevCategories) => {
      const refSite = findSiteGlobally(siteId, prevCategories);
      const refCode = refSite?.siteId?.trim().toLowerCase();
      const refMeter = refSite?.meterId?.trim();
      const affectedCatIds = new Set<string>();
      const nowIso = new Date().toISOString();
      const userName = currentUser?.name || 'Petugas';

      const updated = prevCategories.map((cat) => {
        let modified = false;
        const sites = cat.sites.map((site) => {
          const isExactMatch = site.id === siteId;
          const isSameSiteCode = Boolean(
            refCode &&
              refCode !== '' &&
              ((site.siteId && site.siteId.trim().toLowerCase() === refCode) ||
                (site.siteName && site.siteName.toLowerCase().includes(refCode)))
          );
          const isSameMeter = Boolean(
            refMeter &&
              refMeter !== '' &&
              refMeter !== '-' &&
              site.meterId &&
              site.meterId === refMeter
          );

          if (isExactMatch || isSameSiteCode || isSameMeter) {
            modified = true;
            const currentTokens = site.tokens || [];
            return {
              ...site,
              tokens: [...currentTokens, token],
              updatedAt: nowIso,
              updatedBy: userName,
            };
          }
          return site;
        });

        if (modified) {
          affectedCatIds.add(cat.id);
        }

        return { ...cat, sites };
      });

      saveCategories(updated);

      setTimeout(() => {
        updated.forEach((c) => {
          if (affectedCatIds.has(c.id)) {
            saveCategoryToFirestore(c).catch((e) => console.error('Token sync error:', e));
          }
        });
      }, 0);

      return updated;
    });
    showToast(`Token listrik berhasil ditambahkan`);
  }, [currentUser?.name, showToast]);

  const handleRemoveToken = useCallback((siteId: string, tokenIndex: number) => {
    setCategories((prevCategories) => {
      const refSite = findSiteGlobally(siteId, prevCategories);
      const refCode = refSite?.siteId?.trim().toLowerCase();
      const refMeter = refSite?.meterId?.trim();
      const affectedCatIds = new Set<string>();
      const nowIso = new Date().toISOString();
      const userName = currentUser?.name || 'Petugas';

      const updated = prevCategories.map((cat) => {
        let modified = false;
        const sites = cat.sites.map((site) => {
          const isExactMatch = site.id === siteId;
          const isSameSiteCode = Boolean(
            refCode &&
              refCode !== '' &&
              ((site.siteId && site.siteId.trim().toLowerCase() === refCode) ||
                (site.siteName && site.siteName.toLowerCase().includes(refCode)))
          );
          const isSameMeter = Boolean(
            refMeter &&
              refMeter !== '' &&
              refMeter !== '-' &&
              site.meterId &&
              site.meterId === refMeter
          );

          if (isExactMatch || isSameSiteCode || isSameMeter) {
            modified = true;
            const currentTokens = site.tokens || [];
            return {
              ...site,
              tokens: currentTokens.filter((_, idx) => idx !== tokenIndex),
              updatedAt: nowIso,
              updatedBy: userName,
            };
          }
          return site;
        });

        if (modified) {
          affectedCatIds.add(cat.id);
        }

        return { ...cat, sites };
      });

      saveCategories(updated);

      setTimeout(() => {
        updated.forEach((c) => {
          if (affectedCatIds.has(c.id)) {
            saveCategoryToFirestore(c).catch((e) => console.error('Token removal sync error:', e));
          }
        });
      }, 0);

      return updated;
    });
  }, [currentUser?.name]);

  // Photo Permanent Storage & Synchronization (Optimistic & Instant 0ms Latency)
  const handleSavePhoto = useCallback(async (siteId: string, photo: PhotoRecord): Promise<void> => {
    // 1. Instantly update local React state and storage so UI responds in 0ms
    setAllPhotos((prev) => [photo, ...prev.filter((p) => p.id !== photo.id)]);

    setCategories((prevCategories) => {
      const updated = updateSiteGlobally(prevCategories, siteId, (site) => {
        const existingPhotos = site.photos || [];
        const exists = existingPhotos.some((p) => p.id === photo.id);
        const newPhotos = exists
          ? existingPhotos.map((p) => (p.id === photo.id ? photo : p))
          : [...existingPhotos, photo];
        return {
          ...site,
          photos: newPhotos,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.name || 'Petugas',
        };
      });

      saveCategories(updated);
      return updated;
    });

    setCameraSite(null);
    setCameraCategory(null);

    // 2. Automatically save copy to device Phone Gallery / Media Album
    let gallerySaved = false;
    if (photo.dataUrl) {
      try {
        const result = await savePhotoToPhoneGallery(
          photo.dataUrl,
          photo.categoryTitle || photo.categoryType || 'swacam',
          photo.siteName || photo.siteId || siteId
        );
        gallerySaved = result.success;
      } catch (e) {
        console.warn('Gallery save notice:', e);
      }
    }

    if (gallerySaved) {
      showToast(`Foto (${photo.brandTitle || 'DEPOTEL'}) tersimpan di Cloud & Galeri HP!`);
    } else {
      showToast(`Foto (${photo.brandTitle || 'DEPOTEL'}) tersimpan di Cloud!`);
    }

    // 2. Perform Firebase Cloud Storage upload and Firestore write in background without blocking UI
    setTimeout(async () => {
      try {
        const savedPhoto = await savePhotoPermanently(photo);

        // Update with permanent storageUrl once background write completes
        setAllPhotos((prev) => [savedPhoto, ...prev.filter((p) => p.id !== savedPhoto.id)]);

        setCategories((prevCategories) => {
          const refSite = findSiteGlobally(siteId, prevCategories);
          const refCode = refSite?.siteId?.trim().toLowerCase();
          const refMeter = refSite?.meterId?.trim();
          const affectedCatIds = new Set<string>();

          const updated = prevCategories.map((cat) => {
            let modified = false;
            const sites = cat.sites.map((site) => {
              const isExactMatch = site.id === siteId;
              const isSameSiteCode = Boolean(
                refCode &&
                  refCode !== '' &&
                  ((site.siteId && site.siteId.trim().toLowerCase() === refCode) ||
                    (site.siteName && site.siteName.toLowerCase().includes(refCode)))
              );
              const isSameMeter = Boolean(
                refMeter &&
                  refMeter !== '' &&
                  refMeter !== '-' &&
                  site.meterId &&
                  site.meterId === refMeter
              );

              if (isExactMatch || isSameSiteCode || isSameMeter) {
                modified = true;
                const existingPhotos = site.photos || [];
                const newPhotos = existingPhotos.map((p) => (p.id === savedPhoto.id ? savedPhoto : p));
                return {
                  ...site,
                  photos: newPhotos,
                };
              }
              return site;
            });

            if (modified) {
              affectedCatIds.add(cat.id);
            }

            return { ...cat, sites };
          });

          saveCategories(updated);

          updated.forEach((c) => {
            if (affectedCatIds.has(c.id)) {
              saveCategoryToFirestore(c).catch((e) => console.error('Category photo sync notice:', e));
            }
          });

          return updated;
        });
      } catch (err) {
        console.warn('Background photo upload notice:', err);
      }
    }, 0);
  }, [currentUser?.name, showToast]);

  const handleDeletePhoto = useCallback(async (siteId: string, photoId: string): Promise<void> => {
    if (!currentUser) {
      const msg = 'Akses ditolak: Silakan masuk terlebih dahulu untuk menghapus foto.';
      showToast(msg);
      throw new Error(msg);
    }

    const targetPhoto = allPhotos.find((p) => p.id === photoId);
    await deletePhotoPermanently(photoId, targetPhoto?.storagePath);

    setAllPhotos((prev) => prev.filter((p) => p.id !== photoId));

    setCategories((prevCategories) => {
      const updated = prevCategories.map((cat) => ({
        ...cat,
        sites: cat.sites.map((site) => {
          if (!site.photos) return site;
          return {
            ...site,
            photos: site.photos.filter((p) => p.id !== photoId),
          };
        }),
      }));
      saveCategories(updated);
      updated.forEach((c) => saveCategoryToFirestore(c).catch((e) => console.error(e)));
      return updated;
    });

    setViewingPhoto(null);
    showToast('Foto dokumentasi berhasil dihapus permanen oleh Administrator');
  }, [currentUser?.role, allPhotos, showToast]);

  // Site Edit & Add (Diperbarui di semua kategori)
  const handleEditSite = useCallback((site: SiteItem) => {
    setEditingSite(site);
  }, []);

  const handleSaveEditedSite = useCallback(async (updatedSite: SiteItem) => {
    const oldRefSite = findSiteGlobally(updatedSite.id, categories);
    const oldCode = oldRefSite?.siteId?.trim().toLowerCase();
    const oldMeter = oldRefSite?.meterId?.trim();
    const newCode = updatedSite.siteId?.trim().toLowerCase();
    const newMeter = updatedSite.meterId?.trim();
    const nowIso = new Date().toISOString();
    const userName = currentUser?.name || 'Petugas';

    const affectedCatIds = new Set<string>();

    const updated = categories.map((cat) => {
      let modified = false;
      const sites = cat.sites.map((site) => {
        const isExactMatch = site.id === updatedSite.id;
        const isSameSiteCode = Boolean(
          (oldCode && oldCode !== '' && ((site.siteId && site.siteId.trim().toLowerCase() === oldCode) || (site.siteName && site.siteName.toLowerCase().includes(oldCode)))) ||
          (newCode && newCode !== '' && ((site.siteId && site.siteId.trim().toLowerCase() === newCode) || (site.siteName && site.siteName.toLowerCase().includes(newCode))))
        );
        const isSameMeter = Boolean(
          (oldMeter && oldMeter !== '' && oldMeter !== '-' && site.meterId && site.meterId === oldMeter) ||
          (newMeter && newMeter !== '' && newMeter !== '-' && site.meterId && site.meterId === newMeter)
        );

        if (isExactMatch || isSameSiteCode || isSameMeter) {
          modified = true;
          return {
            ...site,
            siteId: updatedSite.siteId,
            siteName: updatedSite.siteName,
            meterId: updatedSite.meterId,
            updatedAt: nowIso,
            updatedBy: userName,
          };
        }
        return site;
      });

      if (modified) {
        affectedCatIds.add(cat.id);
      }

      return { ...cat, sites };
    });

    try {
      const affectedCats = updated.filter((c) => affectedCatIds.has(c.id));
      for (const cat of affectedCats) {
        await saveCategoryToFirestore(cat);
      }
      setCategories(updated);
      saveCategories(updated);
      setEditingSite(null);
      showToast(`Data site ${updatedSite.siteId} berhasil diperbarui permanen di database`);
    } catch (err: any) {
      console.error('Error saving edited site to Firestore:', err);
      showToast(`Gagal memperbarui site di database: ${err?.message || err}`);
    }
  }, [categories, currentUser?.name, showToast]);

  const handleAddSite = useCallback(async (siteData: { meterId: string; siteId: string; siteName: string }) => {
    const newSite: SiteItem = {
      id: `site-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meterId: siteData.meterId,
      siteId: siteData.siteId,
      siteName: siteData.siteName,
      checked: false,
      tokens: [],
      photos: [],
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Petugas',
    };

    const targetCategory = categories.find((c) => c.id === selectedCategoryId);
    if (!targetCategory) {
      showToast('Kategori tujuan tidak ditemukan.');
      return;
    }

    const updatedCategory: UpdateCategory = {
      ...targetCategory,
      sites: [...targetCategory.sites, newSite],
    };

    try {
      await saveCategoryToFirestore(updatedCategory);

      const updatedCategories = categories.map((cat) =>
        cat.id === selectedCategoryId ? updatedCategory : cat
      );

      setCategories(updatedCategories);
      saveCategories(updatedCategories);
      setShowAddSiteModal(false);
      showToast(`Site ${newSite.siteId} berhasil ditambahkan permanen ke database`);
    } catch (err: any) {
      console.error('Error adding site to Firestore:', err);
      showToast(`Gagal menambahkan site ke database: ${err?.message || err}`);
    }
  }, [categories, selectedCategoryId, currentUser?.name, showToast]);

  const handleDeleteSite = useCallback((siteId: string) => {
    let foundCategory = categories.find((c) => c.id === selectedCategoryId);
    let siteToDelete = foundCategory?.sites.find((s) => s.id === siteId);

    if (!siteToDelete) {
      for (const cat of categories) {
        const found = cat.sites.find((s) => s.id === siteId);
        if (found) {
          siteToDelete = found;
          foundCategory = cat;
          break;
        }
      }
    }

    if (!siteToDelete) {
      showToast('Data site tidak ditemukan');
      return;
    }

    setDeleteModalState({
      type: 'site',
      site: siteToDelete,
      category: foundCategory,
    });
  }, [categories, selectedCategoryId, showToast]);

  const handleEditCategory = useCallback((cat: UpdateCategory) => {
    setEditingCategory(cat);
  }, []);

  const handleSaveEditedCategory = useCallback(async (updatedCategory: UpdateCategory) => {
    try {
      await saveCategoryToFirestore(updatedCategory);
      setCategories((prev) => {
        const updated = prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat));
        saveCategories(updated);
        return updated;
      });
      setEditingCategory(null);
      showToast(`Judul & periode "${updatedCategory.title}" berhasil diperbarui di database`);
    } catch (err: any) {
      console.error('Error saving edited category to Firestore:', err);
      showToast(`Gagal menyimpan perubahan kategori: ${err?.message || err}`);
    }
  }, [showToast]);

  const handleAddCategory = useCallback(async (newCat: UpdateCategory) => {
    try {
      // 1. Save new category directly to Firestore
      await saveCategoryToFirestore(newCat);

      // 2. Update local React state & localStorage
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === newCat.id);
        const updated = exists ? prev.map((c) => (c.id === newCat.id ? newCat : c)) : [...prev, newCat];
        saveCategories(updated);
        return updated;
      });

      // 3. Immediately select new category & open detail view so list appears instantly
      setSelectedCategoryId(newCat.id);
      setViewMode('detail');
      setShowAddCategoryModal(false);
      showToast(`Periode baru "${newCat.title}" (${newCat.sites.length} site) berhasil dibuat`);
    } catch (err: any) {
      console.error('Error creating new category in Firestore:', err);
      showToast(`Gagal membuat periode baru di database: ${err?.message || err}`);
      throw err;
    }
  }, [showToast]);

  const handleUpdateSiteCount = useCallback(async (categoryId: string, newTotal: number) => {
    if (currentUser?.role !== 'admin') {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah jumlah site.');
      return;
    }

    const targetCat = categories.find((c) => c.id === categoryId);
    if (!targetCat) return;

    const currentCount = targetCat.sites.length;
    if (newTotal === currentCount) return;

    let newSites: SiteItem[] = [];
    if (newTotal < currentCount) {
      newSites = targetCat.sites.slice(0, newTotal);
    } else {
      const additionalCount = newTotal - currentCount;
      const additionalSites: SiteItem[] = Array.from({ length: additionalCount }).map(
        (_, idx) => {
          const num = currentCount + idx + 1;
          return {
            id: `site-exp-${Date.now()}-${num}`,
            meterId: (538720000000 + num * 97).toString(),
            siteId: `EXP${num.toString().padStart(3, '0')}`,
            siteName: `Site Tambahan ${num}`,
            checked: false,
            tokens: [],
            photos: [],
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Petugas',
          };
        }
      );
      newSites = [...targetCat.sites, ...additionalSites];
    }

    const updatedCategory: UpdateCategory = {
      ...targetCat,
      sites: newSites,
    };

    try {
      await saveCategoryToFirestore(updatedCategory);
      const updatedCategories = categories.map((c) => (c.id === categoryId ? updatedCategory : c));
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
      showToast(`Total site berhasil disesuaikan menjadi ${newTotal} dan disimpan ke database`);
    } catch (err: any) {
      console.error('Error updating site count in Firestore:', err);
      showToast(`Gagal memperbarui jumlah site di database: ${err?.message || err}`);
    }
  }, [categories, currentUser?.role, currentUser?.name, showToast]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menghapus kategori.');
      return;
    }
    const catToDelete = categories.find((c) => c.id === categoryId);
    if (!catToDelete) return;
    setDeleteModalState({
      type: 'category',
      category: catToDelete,
    });
  }, [categories, currentUser?.role, showToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModalState) return;

    if (deleteModalState.type === 'site' && deleteModalState.site) {
      const siteId = deleteModalState.site.id;
      const targetCatId = deleteModalState.category?.id || selectedCategoryId;
      const siteName = deleteModalState.site.siteId || deleteModalState.site.siteName;

      // Identify categories from which the site should be removed
      const updatedCategories = categories.map((cat) => {
        if (targetCatId && cat.id !== targetCatId) return cat;
        return {
          ...cat,
          sites: cat.sites.filter((s) => s.id !== siteId),
        };
      });

      const affectedCategories = updatedCategories.filter(
        (c) => !targetCatId || c.id === targetCatId
      );

      try {
        // Save deletion permanently to Firestore BEFORE updating UI state
        for (const cat of affectedCategories) {
          await saveCategoryToFirestore(cat);
        }

        // Now commit update to React state & localStorage permanently
        setCategories(updatedCategories);
        saveCategories(updatedCategories);
        showToast(`Site ${siteName} berhasil dihapus permanen dari database`);
      } catch (err: any) {
        console.error('Error deleting site from Firestore:', err);
        showToast(`Gagal menghapus site dari database: ${err?.message || err}`);
      }
    } else if (deleteModalState.type === 'category' && deleteModalState.category) {
      const catId = deleteModalState.category.id;
      const catTitle = deleteModalState.category.title;

      try {
        // Save category deletion permanently to Firestore BEFORE updating UI state
        await deleteCategoryFromFirestore(catId);

        const remainingCategories = categories.filter((c) => c.id !== catId);
        if (selectedCategoryId === catId && remainingCategories.length > 0) {
          setSelectedCategoryId(remainingCategories[0].id);
        }
        setCategories(remainingCategories);
        saveCategories(remainingCategories);
        showToast(`Kategori "${catTitle}" berhasil dihapus permanen dari database`);
      } catch (err: any) {
        console.error('Error deleting category from Firestore:', err);
        showToast(`Gagal menghapus kategori dari database: ${err?.message || err}`);
      }
    }

    setDeleteModalState(null);
  }, [deleteModalState, selectedCategoryId, categories, showToast]);

  // User Management with Firestore Persistence and Server-side authorization check
  const handleAddUser = async (partialUser: Partial<User>): Promise<void> => {
    if (currentUser?.role !== 'admin') {
      const msg = 'Akses ditolak: Hanya Administrator yang berwenang menambah pengguna.';
      showToast(msg);
      throw new Error(msg);
    }

    const cleanName = partialUser.name?.trim() || '';
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Nama anggota minimal 2 karakter.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: partialUser.email?.trim() || undefined,
      role: partialUser.role || 'user',
      avatar: partialUser.avatar || '/logo.png',
      status: 'active',
      isOnline: false,
      lastSeen: 'Baru ditambahkan',
    };

    // 1. Save to Firestore FIRST and await confirmation
    await saveUserToFirestore(newUser);

    // 2. Only after database confirms, update local state
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      const updated = exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [...prev, newUser];
      saveUsers(updated);
      return updated;
    });

    showToast(`Pengguna "${newUser.name}" berhasil disimpan ke database`);
  };

  const handleUpdateUser = async (updated: User): Promise<void> => {
    if (currentUser?.role !== 'admin' && currentUser?.id !== updated.id) {
      const msg = 'Akses ditolak: Anda tidak memiliki izin untuk mengubah data pengguna ini.';
      showToast(msg);
      throw new Error(msg);
    }

    const cleanUpdated: User = {
      ...updated,
      name: updated.name.trim(),
      email: updated.email ? updated.email.trim() : undefined,
    };

    // 1. Save to Firestore FIRST and await confirmation
    await saveUserToFirestore(cleanUpdated);

    // 2. Update local state
    setUsers((prev) => {
      const list = prev.map((u) => (u.id === cleanUpdated.id ? cleanUpdated : u));
      saveUsers(list);
      return list;
    });

    if (currentUser?.id === cleanUpdated.id) {
      setCurrentUser(cleanUpdated);
      saveSession(cleanUpdated);
    }

    showToast(`Data "${cleanUpdated.name}" berhasil diperbarui di database`);
  };

  const handleDeleteUser = async (userId: string, permanent: boolean = true): Promise<void> => {
    if (currentUser?.role !== 'admin') {
      const msg = 'Akses ditolak: Hanya Administrator yang berwenang mengelola pengguna.';
      showToast(msg);
      throw new Error(msg);
    }
    if (userId === currentUser?.id) {
      const msg = 'Tidak dapat menghapus akun Anda sendiri.';
      showToast(msg);
      throw new Error(msg);
    }

    if (permanent) {
      await deleteUserFromFirestore(userId);
      setUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== userId);
        saveUsers(filtered);
        return filtered;
      });
      showToast('Pengguna telah berhasil dihapus permanen dari database');
    } else {
      const target = users.find((u) => u.id === userId);
      if (target) {
        const deactivated: User = { ...target, status: 'inactive' };
        await saveUserToFirestore(deactivated);
        setUsers((prev) => {
          const updated = prev.map((u) => (u.id === userId ? deactivated : u));
          saveUsers(updated);
          return updated;
        });
        showToast('Pengguna berhasil dinonaktifkan di database');
      }
    }
  };

  // Direct profile update for Administrator and Regular User (Permanent Firestore persistence)
  const handleUpdateProfile = async (updatedFields: Partial<User>): Promise<void> => {
    if (!currentUser) {
      throw new Error('Anda belum masuk ke sistem.');
    }

    const cleanUser: User = {
      ...currentUser,
      ...updatedFields,
      id: currentUser.id, // Strictly protect permanent user ID
      role: currentUser.role, // Strictly protect role
    };

    if (updatedFields.name) {
      const cleanName = updatedFields.name.trim();
      if (!cleanName || cleanName.length < 2) {
        throw new Error('Nama profil minimal 2 karakter.');
      }
      cleanUser.name = cleanName;
    }

    // 1. Save directly to Firestore and await confirmation
    await saveUserToFirestore(cleanUser);

    // 2. Synchronize current session and users state
    setCurrentUser(cleanUser);
    saveSession(cleanUser);
    setUsers((prev) => {
      const updatedList = prev.map((u) => (u.id === cleanUser.id ? cleanUser : u));
      saveUsers(updatedList);
      return updatedList;
    });

    showToast('Profil berhasil disimpan permanen ke database');
  };

  const handleCreateInvite = (role: UserRole): InviteLink => {
    const newInvite: InviteLink = {
      id: `inv-${Date.now()}`,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: currentUser?.name || 'Admin',
      role,
      usedBy: [],
      active: true,
    };
    setInvites((prev) => {
      const updated = [newInvite, ...prev];
      saveInvites(updated);
      saveInviteToFirestore(newInvite).catch((e) => console.error(e));
      return updated;
    });
    showToast(`Tautan undangan kode ${newInvite.code} berhasil dibuat`);
    return newInvite;
  };

  // Google Drive Import Handler
  const handleImportSitesFromDrive = (importedSites: SiteItem[], categoryTitle: string) => {
    const existingIndex = categories.findIndex(
      (c) => c.title.toLowerCase() === categoryTitle.toLowerCase()
    );

    if (existingIndex >= 0) {
      setCategories((prev) =>
        prev.map((cat, idx) => {
          if (idx !== existingIndex) return cat;
          const existingIds = new Set(cat.sites.map((s) => s.siteId));
          const newSites = importedSites.filter((s) => !existingIds.has(s.siteId));
          return {
            ...cat,
            sites: [...cat.sites, ...newSites],
          };
        })
      );
      showToast(`${importedSites.length} site berhasil disinkronkan ke "${categoryTitle}"`);
    } else {
      const newCategory: UpdateCategory = {
        id: `cat-drive-${Date.now()}`,
        title: categoryTitle || 'Google Drive Sync',
        period: `Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
        type: 'custom',
        sites: importedSites,
        allowCamera: true,
        allowTokenInput: true,
      };
      setCategories((prev) => [newCategory, ...prev]);
      setSelectedCategoryId(newCategory.id);
      setViewMode('detail');
      showToast(`Kategori "${newCategory.title}" berhasil dibuat dengan ${importedSites.length} site`);
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    setCategories(INITIAL_CATEGORIES);
    saveCategories(INITIAL_CATEGORIES);
    setUsers(INITIAL_USERS);
    saveUsers(INITIAL_USERS);
    showToast('Seluruh data berhasil dikembalikan ke standar awal');
  };

  // If user is not logged in, show Login / User selector
  if (!currentUser) {
    return (
      <LoginModal
        users={users}
        inviteCode={inviteCodeFromUrl}
        serverErrorMessage={loginErrorMessage}
        onLogin={handleRegisteredUserLogin}
        onGoogleSignIn={handleGoogleAdminSignIn}
        onRegisterFromInvite={handleRegisterFromInvite}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen flex bg-[#f4f6fa] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        {/* Offline indicator bar */}
        <OfflineBanner />

        {/* Desktop Sidebar with Beranda & Pengaturan placed vertically at the bottom footer */}
        <Sidebar
          currentUser={currentUser}
          activeNav={activeNav}
          onSelectNav={(nav) => {
            setActiveNav(nav);
            if (nav === 'dashboard') {
              setViewMode('overview');
            }
          }}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => {
            setSelectedCategoryId(catId);
            setViewMode('detail');
          }}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
          onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
        />

        {/* Right Content Area with responsive offset for Sidebar */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
          {/* Top Header */}
          <Header
            currentUser={currentUser}
            onOpenUserManagement={() => {
              if (currentUser?.role !== 'admin') {
                showToast('Akses ditolak: Hanya Administrator yang berwenang mengelola pengguna.');
                return;
              }
              setShowUserManagement(true);
            }}
            onOpenInviteModal={() => {
              if (currentUser?.role !== 'admin') {
                showToast('Akses ditolak: Hanya Administrator yang berwenang membuat tautan undangan.');
                return;
              }
              setShowInviteModal(true);
            }}
            onOpenLogoutModal={() => setShowAccountSettings(true)}
            onToggleMobileSidebar={() => setIsOpenMobileSidebar(true)}
            onRefresh={handleRefresh}
            onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
            onSelectNav={(nav) => {
              setActiveNav(nav);
              if (nav === 'dashboard') {
                setViewMode('overview');
              }
            }}
            isRefreshing={isRefreshing}
          />

          {/* Main Content Area: pb-24 on mobile ensures footer bottom navigation never covers content */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
            {/* Conditional rendering between Beranda (Dashboard) and Pengaturan (Settings) */}
            {activeNav === 'dashboard' ? (
              viewMode === 'overview' ? (
                <DashboardOverview
                  categories={categories}
                  currentUser={currentUser}
                  onOpenCategory={handleOpenCategory}
                  onOpenInviteModal={() => {
                    if (currentUser?.role !== 'admin') {
                      showToast('Akses ditolak: Hanya Administrator yang berwenang membuat tautan undangan.');
                      return;
                    }
                    setShowInviteModal(true);
                  }}
                  onOpenAddCategoryModal={() => {
                    if (currentUser?.role !== 'admin') {
                      showToast('Akses ditolak: Hanya Administrator yang berwenang menambah periode baru.');
                      return;
                    }
                    setShowAddCategoryModal(true);
                  }}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateSiteCount={handleUpdateSiteCount}
                />
              ) : currentCategory ? (
                <CategoryDetailView
                  category={currentCategory}
                  currentUser={currentUser}
                  onBackToOverview={handleBackToOverview}
                  onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                  onEditCategoryTitle={() => handleEditCategory(currentCategory)}
                  onAddNewSite={() => setShowAddSiteModal(true)}
                  onToggleCheck={handleToggleCheck}
                  onEditSite={handleEditSite}
                  onDeleteSite={handleDeleteSite}
                  onAddToken={handleAddToken}
                  onRemoveToken={handleRemoveToken}
                  onOpenCamera={(s) => {
                    setCameraSite(s);
                    setCameraCategory(currentCategory);
                  }}
                  onViewPhoto={(s, idx) => setViewingPhoto({ site: s, index: idx })}
                />
              ) : null
            ) : (
              <SettingsView
                currentUser={currentUser}
                users={users}
                categories={categories}
                invites={invites}
                onUpdateProfile={(updated) => {
                  const u = { ...currentUser, ...updated };
                  setCurrentUser(u);
                  saveSession(u);
                  setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
                }}
                onOpenUserManagement={() => {
                  if (currentUser?.role !== 'admin') {
                    showToast('Akses ditolak: Hanya Administrator yang berwenang mengelola pengguna.');
                    return;
                  }
                  setShowUserManagement(true);
                }}
                onOpenInviteModal={() => {
                  if (currentUser?.role !== 'admin') {
                    showToast('Akses ditolak: Hanya Administrator yang berwenang membuat tautan undangan.');
                    return;
                  }
                  setShowInviteModal(true);
                }}
                onOpenExportModal={() => setShowExportModal(true)}
                onOpenAddCategoryModal={() => {
                  if (currentUser?.role !== 'admin') {
                    showToast('Akses ditolak: Hanya Administrator yang berwenang menambah periode baru.');
                    return;
                  }
                  setShowAddCategoryModal(true);
                }}
                onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
                onLogout={handleLogout}
                onResetData={handleResetData}
                onRefresh={handleRefresh}
                onSwitchUser={handleSelectUser}
                onCheckForUpdate={() => checkForAppUpdate(true)}
                isCheckingUpdate={isCheckingUpdate}
                isRefreshing={isRefreshing}
              />
            )}
          </main>

          {/* Desktop Footer */}
          <footer className="mt-auto py-6 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>© 2026 DEPOTEL GROUP · MONITORING · Checklist & Token Listrik Site Monitoring System</p>
          </footer>
        </div>

        {/* ======================================================== */}
        {/* MOBILE FOOTER NAVIGATION BAR: BERANDA & PENGATURAN */}
        {/* ======================================================== */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#141726]/95 backdrop-blur-md border-t border-slate-800 z-40 px-6 py-2 flex items-center justify-around shadow-2xl">
          {/* 1. Beranda (Home Icon) */}
          <button
            onClick={() => {
              setActiveNav('dashboard');
              setViewMode('overview');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition cursor-pointer select-none py-1.5 px-6 rounded-2xl ${
              activeNav === 'dashboard'
                ? 'text-white bg-blue-600 shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </button>

          {/* 2. Pengaturan (Settings Icon) */}
          <button
            onClick={() => {
              setActiveNav('settings');
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition cursor-pointer select-none py-1.5 px-6 rounded-2xl ${
              activeNav === 'settings'
                ? 'text-white bg-blue-600 shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Vercel Deployment New Version Notification Banner */}
        {hasUpdateAvailable && (
          <aside
            aria-label="Notifikasi Pembaruan Aplikasi"
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-60 bg-[#1e2238] border border-blue-400 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Versi Baru Tersedia</p>
                <p className="text-[11px] text-slate-300 leading-tight">Pembaruan telah dipublikasikan di Vercel.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleApplyUpdate}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Perbarui</span>
              </button>
              <button
                type="button"
                onClick={() => setHasUpdateAvailable(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 bg-[#1e2238] border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Lazy-Loaded Modals & Dialogs (Loaded on-demand to optimize initial bundle & memory) */}
        <React.Suspense fallback={null}>
          {cameraSite && (
            <CameraModal
              site={cameraSite}
              category={cameraCategory || currentCategory}
              categoryTitle={(cameraCategory || currentCategory)?.title}
              currentUser={currentUser}
              onClose={() => {
                setCameraSite(null);
                setCameraCategory(null);
              }}
              onSavePhoto={handleSavePhoto}
            />
          )}

          {viewingPhoto && (
            <PhotoGalleryModal
              site={viewingPhoto.site}
              initialIndex={viewingPhoto.index}
              currentUser={currentUser}
              onClose={() => setViewingPhoto(null)}
              onDeletePhoto={handleDeletePhoto}
            />
          )}

          {editingSite && (
            <EditSiteModal
              site={editingSite}
              onClose={() => setEditingSite(null)}
              onSave={handleSaveEditedSite}
            />
          )}

          {showAddSiteModal && (
            <AddSiteModal
              onClose={() => setShowAddSiteModal(false)}
              onAddSite={handleAddSite}
            />
          )}

          {showAddCategoryModal && (
            <AddCategoryModal
              existingCategories={categories}
              onClose={() => setShowAddCategoryModal(false)}
              onAddCategory={handleAddCategory}
            />
          )}

          {showWhatsAppModal && currentCategory && (
            <WhatsAppModal
              category={currentCategory}
              onClose={() => setShowWhatsAppModal(false)}
            />
          )}

          {showExportModal && currentCategory && (
            <ExportModal
              category={currentCategory}
              onClose={() => setShowExportModal(false)}
            />
          )}

          {showUserManagement && (
            <UserManagementModal
              users={users}
              currentUser={currentUser}
              invites={invites}
              onClose={() => setShowUserManagement(false)}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onCreateInvite={handleCreateInvite}
            />
          )}

          {showAccountSettings && (
            <AccountSettingsModal
              currentUser={currentUser}
              onClose={() => setShowAccountSettings(false)}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {showInviteModal && (
            <InviteModal
              onClose={() => setShowInviteModal(false)}
              onCreateInvite={handleCreateInvite}
            />
          )}

          {editingCategory && (
            <EditCategoryModal
              category={editingCategory}
              onClose={() => setEditingCategory(null)}
              onSaveCategory={handleSaveEditedCategory}
            />
          )}

          {deleteModalState && (
            <ConfirmDeleteModal
              type={deleteModalState.type}
              site={deleteModalState.site}
              category={deleteModalState.category}
              categoryTitle={deleteModalState.category?.title}
              onClose={() => setDeleteModalState(null)}
              onConfirm={handleConfirmDelete}
            />
          )}

          {showGoogleDriveModal && (
            <GoogleDriveModal
              currentUser={currentUser}
              categories={categories}
              onClose={() => setShowGoogleDriveModal(false)}
              onImportSitesFromDrive={handleImportSitesFromDrive}
              onShowToast={showToast}
            />
          )}
        </React.Suspense>
      </div>
    </PullToRefresh>
  );
}
