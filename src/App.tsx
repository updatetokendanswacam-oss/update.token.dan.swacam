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
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import {
  syncUserProfile,
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveInviteToFirestore,
} from './utils/firestoreService';
import { INITIAL_CATEGORIES, INITIAL_USERS } from './utils/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OfflineBanner } from './components/OfflineBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import { PullToRefresh } from './components/PullToRefresh';
import { Home, Settings } from 'lucide-react';

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

  // View state within site monitoring: 'overview' or 'detail'
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    const cats = loadCategories();
    return cats[0]?.id || 'cat-token-manual';
  });

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
  const [viewingPhoto, setViewingPhoto] = useState<{ site: SiteItem; index: number } | null>(null);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) {
        setInviteCodeFromUrl(invite);
      }
    }
  }, []);

  // Real-time synchronization of authenticated Firebase user and verified role
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const verifiedUser = await syncUserProfile(fbUser);
          setCurrentUser(verifiedUser);
          saveSession(verifiedUser);
        } catch (err) {
          console.error('Error synchronizing auth user profile:', err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Real-time subscription to persistent Firestore categories (Survives refresh & reconnects)
  useEffect(() => {
    const unsubscribeCats = subscribeToCategories((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
        saveCategories(remoteCats);
      }
    });

    return () => {
      unsubscribeCats();
    };
  }, []);

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

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    const t = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setCategories(loadCategories());
    setUsers(loadUsers());
    setIsRefreshing(false);
    showToast('Data berhasil diperbarui');
  };

  // Find currently open category (memoized)
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || categories[0],
    [categories, selectedCategoryId]
  );

  // User Authentication Handlers (Ketik nama & auto-save setelah 3x masuk)
  const handleTypedLogin = (typedName: string) => {
    const cleanName = typedName.trim();
    if (!cleanName) return;

    let existingUser = users.find(
      (u) => u.name.toLowerCase() === cleanName.toLowerCase()
    );

    const { count, isSaved, wasAlreadySaved } = recordNameLogin(cleanName);

    let loggedInUser: User;
    if (existingUser) {
      loggedInUser = existingUser;
    } else {
      const isAdmin =
        cleanName.toLowerCase().includes('admin') || cleanName.toLowerCase() === 'diki solihin';
      loggedInUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        role: isAdmin ? 'admin' : 'user',
        avatar: '/logo.png',
        status: 'active',
        isOnline: true,
        lastSeen: new Date().toISOString(),
      };

      if (isSaved) {
        setUsers((prev) => {
          const updated = [...prev, loggedInUser];
          saveUsers(updated);
          return updated;
        });
      }
    }

    setCurrentUser(loggedInUser);
    saveSession(loggedInUser);

    if (isSaved && !wasAlreadySaved) {
      showToast(`🎉 Selamat! Nama "${cleanName}" telah masuk 3x dan resmi tersimpan permanen!`);
    } else if (isSaved) {
      showToast(`Masuk sebagai ${cleanName} (Nama Tersimpan)`);
    } else {
      showToast(`Masuk sebagai ${cleanName} (${count}/3x untuk simpan otomatis)`);
    }
  };

  const handleSelectUser = (user: User) => {
    recordNameLogin(user.name);
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
    return currentCats.map((cat) => ({
      ...cat,
      sites: cat.sites.map((site) => {
        const isExactMatch = site.id === targetSiteId;
        const isSameSiteCode =
          refSite?.siteId &&
          refSite.siteId.trim() !== '' &&
          site.siteId &&
          site.siteId.trim() !== '' &&
          site.siteId.toLowerCase() === refSite.siteId.toLowerCase();
        const isSameMeter =
          refSite?.meterId &&
          refSite.meterId.trim() !== '' &&
          refSite.meterId !== '-' &&
          site.meterId &&
          site.meterId === refSite.meterId;

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
      const updated = updateSiteGlobally(prevCategories, targetSiteId, (site) => ({
        ...site,
        checked: newCheckedStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Petugas',
      }));

      saveCategories(updated);

      // Persist affected categories to Firestore safely
      const affectedCategories = updated.filter((c) =>
        c.sites.some((s) => s.id === targetSiteId || (refSite.siteId && s.siteId === refSite.siteId))
      );

      for (const cat of affectedCategories) {
        saveCategoryToFirestore(cat).catch((err) =>
          console.warn('Firestore toggle check sync notice:', err)
        );
      }

      return updated;
    });
  }, [currentUser?.name]);

  // Token Management (Memperbarui nomor token tanpa mengubah status centang secara otomatis)
  const handleAddToken = useCallback((siteId: string, token: string) => {
    setCategories((prevCategories) => {
      const updated = updateSiteGlobally(prevCategories, siteId, (site) => {
        const currentTokens = site.tokens || [];
        return {
          ...site,
          tokens: [...currentTokens, token],
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.name || 'Petugas',
        };
      });
      saveCategories(updated);
      updated.forEach((c) => {
        if (c.sites.some((s) => s.id === siteId)) {
          saveCategoryToFirestore(c).catch((e) => console.error(e));
        }
      });
      return updated;
    });
    showToast(`Token listrik berhasil ditambahkan`);
  }, [currentUser?.name, showToast]);

  const handleRemoveToken = useCallback((siteId: string, tokenIndex: number) => {
    setCategories((prevCategories) => {
      const updated = updateSiteGlobally(prevCategories, siteId, (site) => {
        const currentTokens = site.tokens || [];
        return {
          ...site,
          tokens: currentTokens.filter((_, idx) => idx !== tokenIndex),
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.name || 'Petugas',
        };
      });
      saveCategories(updated);
      updated.forEach((c) => {
        if (c.sites.some((s) => s.id === siteId)) {
          saveCategoryToFirestore(c).catch((e) => console.error(e));
        }
      });
      return updated;
    });
  }, [currentUser?.name]);

  // Photo Watermarking & IndexedDB Storage (Menyimpan foto tanpa mengubah status centang secara otomatis)
  const handleSavePhoto = useCallback(async (siteId: string, photo: PhotoRecord) => {
    try {
      await savePhotoToDB(photo);

      setCategories((prevCategories) => {
        const updated = updateSiteGlobally(prevCategories, siteId, (site) => {
          const existingPhotos = site.photos || [];
          return {
            ...site,
            photos: [...existingPhotos, photo],
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Petugas',
          };
        });
        saveCategories(updated);
        updated.forEach((c) => {
          if (c.sites.some((s) => s.id === siteId)) {
            saveCategoryToFirestore(c).catch((e) => console.error(e));
          }
        });
        return updated;
      });

      setCameraSite(null);
      showToast('Foto dokumentasi SWACAM tersimpan');
    } catch (err) {
      console.error('Failed to save photo record:', err);
      showToast('Gagal menyimpan foto dokumentasi');
    }
  }, [currentUser?.name, showToast]);

  const handleDeletePhoto = useCallback(async (photoId: string) => {
    try {
      await deletePhotoFromDB(photoId);

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
      showToast('Foto berhasil dihapus');
    } catch (err) {
      console.error('Failed to delete photo:', err);
      showToast('Gagal menghapus foto');
    }
  }, [showToast]);

  // Site Edit & Add (Diperbarui di semua kategori)
  const handleEditSite = useCallback((site: SiteItem) => {
    setEditingSite(site);
  }, []);

  const handleSaveEditedSite = useCallback((updatedSite: SiteItem) => {
    setCategories((prev) => {
      const updated = updateSiteGlobally(prev, updatedSite.id, (s) => ({
        ...s,
        siteId: updatedSite.siteId,
        siteName: updatedSite.siteName,
        meterId: updatedSite.meterId,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Petugas',
      }));
      saveCategories(updated);
      updated.forEach((c) => {
        if (c.sites.some((s) => s.id === updatedSite.id)) {
          saveCategoryToFirestore(c).catch((e) => console.error(e));
        }
      });
      return updated;
    });
    setEditingSite(null);
    showToast(`Data site ${updatedSite.siteId} berhasil diperbarui di semua kategori`);
  }, [currentUser?.name, showToast]);

  const handleAddSite = useCallback((siteData: { meterId: string; siteId: string; siteName: string }) => {
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

    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: [...cat.sites, newSite],
        };
      });
      saveCategories(updated);
      const targetCat = updated.find((c) => c.id === selectedCategoryId);
      if (targetCat) {
        saveCategoryToFirestore(targetCat).catch((err) => console.error(err));
      }
      return updated;
    });

    setShowAddSiteModal(false);
    showToast(`Site ${newSite.siteId} berhasil ditambahkan ke daftar`);
  }, [selectedCategoryId, currentUser?.name, showToast]);

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
    if (currentUser?.role !== 'admin') {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah kategori.');
      return;
    }
    setEditingCategory(cat);
  }, [currentUser?.role, showToast]);

  const handleUpdateSiteCount = useCallback((categoryId: string, newTotal: number) => {
    if (currentUser?.role !== 'admin') {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah jumlah site.');
      return;
    }
    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const currentCount = cat.sites.length;
        if (newTotal === currentCount) return cat;

        if (newTotal < currentCount) {
          return {
            ...cat,
            sites: cat.sites.slice(0, newTotal),
          };
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
              };
            }
          );
          return {
            ...cat,
            sites: [...cat.sites, ...additionalSites],
          };
        }
      });
      saveCategories(updated);
      const targetCat = updated.find((c) => c.id === categoryId);
      if (targetCat) {
        saveCategoryToFirestore(targetCat).catch((e) => console.error(e));
      }
      return updated;
    });
    showToast(`Total site berhasil disesuaikan menjadi ${newTotal}`);
  }, [currentUser?.role, showToast]);

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

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModalState) return;

    if (deleteModalState.type === 'site' && deleteModalState.site) {
      const siteId = deleteModalState.site.id;
      const targetCatId = deleteModalState.category?.id || selectedCategoryId;

      setCategories((prev) => {
        const updated = prev.map((cat) => {
          if (targetCatId && cat.id !== targetCatId) return cat;
          return {
            ...cat,
            sites: cat.sites.filter((s) => s.id !== siteId),
          };
        });
        saveCategories(updated);

        // Sync affected categories to Firestore safely
        const affectedCats = updated.filter((c) => !targetCatId || c.id === targetCatId);
        affectedCats.forEach((c) => {
          saveCategoryToFirestore(c).catch((err) =>
            console.error('Firestore delete site sync error:', err)
          );
        });

        return updated;
      });
      showToast(`Site ${deleteModalState.site.siteId || deleteModalState.site.siteName} berhasil dihapus`);
    } else if (deleteModalState.type === 'category' && deleteModalState.category) {
      const catId = deleteModalState.category.id;
      setCategories((prev) => {
        const remaining = prev.filter((c) => c.id !== catId);
        if (selectedCategoryId === catId && remaining.length > 0) {
          setSelectedCategoryId(remaining[0].id);
        }
        saveCategories(remaining);
        deleteCategoryFromFirestore(catId).catch((err) => console.error(err));
        return remaining;
      });
      showToast(`Kategori "${deleteModalState.category.title}" berhasil dihapus`);
    }

    setDeleteModalState(null);
  }, [deleteModalState, selectedCategoryId, showToast]);

  // User Management
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    showToast(`Pengguna ${newUser.name} berhasil ditambahkan`);
  };

  const handleUpdateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
      saveSession(updated);
    }
    showToast(`Data ${updated.name} diperbarui`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      showToast('Tidak dapat menghapus akun Anda sendiri');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Pengguna telah dihapus');
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
        onLogin={handleTypedLogin}
        onGoogleSignIn={() => {
          const firstAdmin = users.find((u) => u.role === 'admin') || users[0];
          if (firstAdmin) handleTypedLogin(firstAdmin.name);
        }}
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
                  onOpenCamera={(s) => setCameraSite(s)}
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
              currentUser={currentUser}
              onClose={() => setCameraSite(null)}
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
              onClose={() => setShowAddCategoryModal(false)}
              onAddCategory={(cat) => {
                setCategories((prev) => {
                  const updated = [...prev, cat];
                  saveCategories(updated);
                  saveCategoryToFirestore(cat).catch((err) => console.error(err));
                  return updated;
                });
                setShowAddCategoryModal(false);
                showToast(`Kategori "${cat.title}" berhasil dibuat`);
              }}
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
              onAddUser={(partialUser) => {
                const newUser: User = {
                  id: `usr-${Date.now()}`,
                  name: partialUser.name || 'Anggota Baru',
                  email: partialUser.email,
                  role: partialUser.role || 'user',
                  avatar: partialUser.avatar || '/logo.png',
                  status: 'active',
                  isOnline: false,
                };
                handleAddUser(newUser);
              }}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={(userId) => {
                handleDeleteUser(userId);
              }}
              onCreateInvite={handleCreateInvite}
            />
          )}

          {showAccountSettings && (
            <AccountSettingsModal
              currentUser={currentUser}
              onClose={() => setShowAccountSettings(false)}
              onLogout={handleLogout}
              onUpdateProfile={(updated) => {
                const u = { ...currentUser, ...updated };
                setCurrentUser(u);
                saveSession(u);
                setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
              }}
            />
          )}

          {showInviteModal && (
            <InviteModal
              onClose={() => setShowInviteModal(false)}
              onCreateInvite={handleCreateInvite}
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
