import React, { useState, useEffect } from 'react';
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
} from './utils/storage';
import { User, UpdateCategory, SiteItem, PhotoRecord, UserRole, InviteLink } from './types';
import { INITIAL_CATEGORIES, INITIAL_USERS } from './utils/initialData';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { TeamStatusRoster } from './components/TeamStatusRoster';
import { DashboardOverview } from './components/DashboardOverview';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SettingsView } from './components/SettingsView';
import { CameraModal } from './components/CameraModal';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { EditSiteModal } from './components/EditSiteModal';
import { AddSiteModal } from './components/AddSiteModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ExportModal } from './components/ExportModal';
import { UserManagementModal } from './components/UserManagementModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { InviteModal } from './components/InviteModal';
import { LoginModal } from './components/LoginModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { PullToRefresh } from './components/PullToRefresh';
import { LayoutDashboard, Settings, UserPlus, LogOut } from 'lucide-react';

export default function App() {
  // Core states
  const [categories, setCategories] = useState<UpdateCategory[]>(() => loadCategories());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadSession());
  const [invites, setInvites] = useState<InviteLink[]>(() => loadInvites());

  // Navigation tab: 'dashboard' | 'settings'
  const [activeNav, setActiveNav] = useState<'dashboard' | 'settings'>('dashboard');

  // View state within dashboard: 'overview' (token__91aaac5f.jpeg) or 'detail' (token_2_624887c0.jpeg)
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

  // Edit Category state (for title & period modal)
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

  // Save changes to localStorage whenever categories change
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveInvites(invites);
  }, [invites]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const isAdmin = currentUser?.role === 'admin';

  // Navigation handlers
  const handleOpenCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewMode('detail');
    setActiveNav('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Site check toggle (Diizinkan untuk Petugas & Admin)
  const handleToggleCheck = (siteId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              checked: !site.checked,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.name || 'Petugas',
            };
          }),
        };
      })
    );
  };

  // Edit site (Khusus Admin)
  const handleEditSite = (site: SiteItem) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengedit data site.');
      return;
    }
    setEditingSite(site);
  };

  const handleSaveEditedSite = (updatedSite: SiteItem) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menyimpan perubahan site.');
      return;
    }
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((s) => (s.id === updatedSite.id ? updatedSite : s)),
        };
      })
    );
    showToast(`Data Site ${updatedSite.siteId} berhasil disimpan.`);
  };

  // Delete site (Khusus Admin)
  const handleDeleteSite = (siteId: string) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menghapus site.');
      return;
    }
    const site =
      currentCategory?.sites.find((s) => s.id === siteId) ||
      categories.flatMap((c) => c.sites).find((s) => s.id === siteId);
    if (!site) return;

    setDeleteModalState({
      type: 'site',
      site,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState) return;
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang berwenang menghapus data.');
      setDeleteModalState(null);
      return;
    }

    if (deleteModalState.type === 'site' && deleteModalState.site) {
      const siteId = deleteModalState.site.id;
      const siteDisplay = deleteModalState.site.siteId || deleteModalState.site.siteName;
      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id !== selectedCategoryId) return cat;
          return {
            ...cat,
            sites: cat.sites.filter((s) => s.id !== siteId),
          };
        })
      );
      showToast(`Site ${siteDisplay} berhasil dihapus dari daftar.`);
    } else if (deleteModalState.type === 'category' && deleteModalState.category) {
      const catId = deleteModalState.category.id;
      const catTitle = deleteModalState.category.title;
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (selectedCategoryId === catId) {
        setSelectedCategoryId(categories.filter((c) => c.id !== catId)[0]?.id || '');
      }
      showToast(`Kategori "${catTitle}" berhasil dihapus.`);
    }

    setDeleteModalState(null);
  };

  // Add site (Khusus Admin)
  const handleAddSite = (newSiteData: Omit<SiteItem, 'id'>) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menambah site.');
      return;
    }
    const newSite: SiteItem = {
      ...newSiteData,
      id: `site-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Petugas',
    };

    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: [newSite, ...cat.sites],
        };
      })
    );
    showToast(`Site ${newSite.siteId} berhasil ditambahkan!`);
  };

  // Token input with Return (Khusus Admin)
  const handleAddToken = (siteId: string, token: string) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menambah token.');
      return;
    }
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            const existingTokens = site.tokens || [];
            return {
              ...site,
              tokens: [...existingTokens, token],
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.name || 'Petugas',
            };
          }),
        };
      })
    );
    showToast(`Nomor token ${token} ditambahkan.`);
  };

  const handleRemoveToken = (siteId: string, tokenIndex: number) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menghapus token.');
      return;
    }
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            const updatedTokens = (site.tokens || []).filter((_, i) => i !== tokenIndex);
            return {
              ...site,
              tokens: updatedTokens,
              updatedAt: new Date().toISOString(),
            };
          }),
        };
      })
    );
    showToast('Nomor token dihapus.');
  };

  // Photos (Khusus Admin)
  const handleSavePhoto = async (siteId: string, photo: PhotoRecord) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menyimpan foto.');
      return;
    }
    await savePhotoToDB(photo);

    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              photos: [photo, ...(site.photos || [])],
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.name || 'Petugas',
            };
          }),
        };
      })
    );
    showToast('Foto KWh meter ber-watermark berhasil disimpan.');
  };

  const handleDeletePhoto = async (siteId: string, photoId: string) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menghapus foto.');
      return;
    }
    await deletePhotoFromDB(photoId);

    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            return {
              ...site,
              photos: (site.photos || []).filter((p) => p.id !== photoId),
            };
          }),
        };
      })
    );
    showToast('Foto dokumentasi telah dihapus.');
  };

  // Category title & period editing (Khusus Admin)
  const handleEditCategory = (cat: UpdateCategory) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengedit kategori.');
      return;
    }
    setEditingCategory(cat);
  };

  const handleSaveCategoryChanges = (newTitle: string, newPeriod: string) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menyimpan perubahan kategori.');
      return;
    }
    if (!editingCategory) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id ? { ...c, title: newTitle, period: newPeriod } : c
      )
    );
    setEditingCategory(null);
    showToast('Kategori berhasil diperbarui.');
  };

  const handleDeleteCategory = (catId: string) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menghapus kategori.');
      return;
    }
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    if (categories.length <= 1) {
      showToast('Minimal harus ada 1 kategori update aktif.');
      return;
    }
    setDeleteModalState({
      type: 'category',
      category: cat,
    });
  };

  // Quick edit total site count in monitoring menu (Khusus Admin)
  const handleUpdateSiteCount = (catId: string, newTotal: number) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengubah jumlah site.');
      return;
    }
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const currentCount = c.sites.length;
        if (newTotal === currentCount) return c;

        if (newTotal < currentCount) {
          return { ...c, sites: c.sites.slice(0, newTotal) };
        } else {
          const extra: SiteItem[] = [];
          for (let i = currentCount + 1; i <= newTotal; i++) {
            extra.push({
              id: `site-${Date.now()}-${i}`,
              meterId: `54000000000${i}`,
              siteId: `SITE${i}`,
              siteName: `SITE_TAMBAHAN_${i}`,
              checked: false,
              tokens: [],
              photos: [],
            });
          }
          return { ...c, sites: [...c.sites, ...extra] };
        }
      })
    );
    showToast(`Jumlah site kategori diperbarui menjadi ${newTotal} site.`);
  };

  const handleAddNewCategory = (newCat: UpdateCategory) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat membuat kategori baru.');
      return;
    }
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
    setViewMode('detail');
    setActiveNav('dashboard');
    showToast(`Kategori "${newCat.title}" berhasil dibuat!`);
  };

  // Reset demo data (Khusus Admin)
  const handleResetData = () => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengatur ulang data.');
      return;
    }
    saveCategories(INITIAL_CATEGORIES);
    saveUsers(INITIAL_USERS);
    setCategories(INITIAL_CATEGORIES);
    setUsers(INITIAL_USERS);
    setSelectedCategoryId(INITIAL_CATEGORIES[0].id);
    setViewMode('overview');
    setActiveNav('dashboard');
    showToast('Data aplikasi telah dikembalikan ke kondisi awal.');
  };

  // User Management (Khusus Admin)
  const handleAddUser = (userData: Partial<User>) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mendaftarkan pengguna baru.');
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Anggota Tim',
      email: userData.email,
      role: userData.role || 'user',
      avatar: '/logo.png',
      status: 'active',
      isOnline: false,
      lastSeen: 'Baru ditambahkan',
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`Anggota ${newUser.name} berhasil didaftarkan!`);
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (!isAdmin && currentUser?.id !== updatedUser.id) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengubah data anggota lain.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      saveSession(updatedUser);
    }
    showToast(`Data anggota ${updatedUser.name} berhasil diperbarui.`);
  };

  const handleDeleteUser = (userId: string, permanent: boolean) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat menghapus anggota.');
      return;
    }
    if (permanent) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('Anggota telah dihapus permanen.');
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'inactive' } : u))
      );
      showToast('Anggota dinonaktifkan.');
    }
  };

  const handleCreateInvite = (role: UserRole): InviteLink => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat membuat link undangan.');
      throw new Error('Akses ditolak: Hanya Admin yang dapat membuat link undangan.');
    }
    const code = `DEPOTEL-${role.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newInvite: InviteLink = {
      id: `inv-${Date.now()}`,
      code,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdBy: currentUser?.name || 'Admin',
      active: true,
    };
    setInvites((prev) => [newInvite, ...prev]);
    return newInvite;
  };

  // Auth
  const handleLogin = (userToLogin: User) => {
    const onlineUser = { ...userToLogin, isOnline: true, lastSeen: 'Baru saja' };
    setCurrentUser(onlineUser);
    saveSession(onlineUser);
    setUsers((prev) => prev.map((u) => (u.id === onlineUser.id ? onlineUser : u)));
    showToast(`Selamat datang, ${onlineUser.name}!`);
  };

  const handleGoogleSignIn = () => {
    const adminUser = users.find((u) => u.email === 'updatetokendanswacam@gmail.com') || users[0];
    handleLogin(adminUser);
  };

  const handleLogout = (forgetDevice: boolean = false) => {
    if (currentUser) {
      const offlineUser = { ...currentUser, isOnline: false, lastSeen: 'Baru saja' };
      setUsers((prev) => prev.map((u) => (u.id === offlineUser.id ? offlineUser : u)));
    }
    clearSession(forgetDevice);
    setCurrentUser(null);
    setShowAccountSettings(false);
    showToast(forgetDevice ? 'Akun telah dihapus dari HP ini.' : 'Sesi berhasil diakhiri.');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const loadedCats = loadCategories();
    const loadedUs = loadUsers();
    setCategories(loadedCats);
    setUsers(loadedUs);
    await new Promise((res) => setTimeout(res, 500));
    setIsRefreshing(false);
    showToast('Data aplikasi berhasil disegarkan.');
  };

  // Login view if no user
  if (!currentUser) {
    return (
      <LoginModal
        users={users}
        inviteCode={inviteCodeFromUrl}
        onLogin={handleLogin}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#f8f9fc] text-slate-800 flex flex-col font-sans selection:bg-[#1e2238] selection:text-white pb-16 sm:pb-0">
        <OfflineBanner />

        {/* Top Navbar */}
        <Header
          currentUser={currentUser}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          onOpenUserManagement={() => setShowUserManagement(true)}
          onOpenInviteModal={() => setShowInviteModal(true)}
          onOpenLogoutModal={() => setShowAccountSettings(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {activeNav === 'dashboard' ? (
            <>
              {/* Status Tim Terdaftar (Read-only banner on dashboard) */}
              <TeamStatusRoster users={users} />

              {/* Conditional View: Overview (Image 1) or Category Detail (Image 2) */}
              {viewMode === 'overview' ? (
                <DashboardOverview
                  categories={categories}
                  currentUser={currentUser}
                  onOpenCategory={handleOpenCategory}
                  onOpenInviteModal={() => setShowInviteModal(true)}
                  onOpenAddCategoryModal={() => setShowAddCategoryModal(true)}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateSiteCount={handleUpdateSiteCount}
                />
              ) : (
                currentCategory && (
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
                )
              )}
            </>
          ) : (
            /* Settings View (Pengaturan Aplikasi & Akun) */
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
              onOpenUserManagement={() => setShowUserManagement(true)}
              onOpenInviteModal={() => setShowInviteModal(true)}
              onOpenExportModal={() => setShowExportModal(true)}
              onOpenAddCategoryModal={() => setShowAddCategoryModal(true)}
              onLogout={handleLogout}
              onResetData={handleResetData}
              onRefresh={handleRefresh}
              onSwitchUser={(targetUser) => {
                handleLogin(targetUser);
              }}
              isRefreshing={isRefreshing}
            />
          )}
        </main>

        {/* Toast Message */}
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-5 right-5 z-50 bg-[#1e2238] border border-slate-700 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Mobile Sticky Bottom Navigation */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-6 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
              activeNav === 'dashboard' ? 'text-[#1e2238]' : 'text-slate-400'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeNav === 'dashboard' ? 'bg-[#1e2238] text-white' : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Dashboard</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <div className="p-1 rounded-xl text-slate-600">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Undang</span>
            </button>
          )}

          <button
            onClick={() => setActiveNav('settings')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
              activeNav === 'settings' ? 'text-[#1e2238]' : 'text-slate-400'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeNav === 'settings' ? 'bg-[#1e2238] text-white' : ''
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <span>Pengaturan</span>
          </button>

          <button
            onClick={() => setShowAccountSettings(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-600 transition cursor-pointer"
          >
            <div className="p-1 rounded-xl text-slate-600">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Keluar</span>
          </button>
        </div>

        {/* Desktop Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200/60 text-center text-xs text-slate-400 hidden sm:block">
          <p>© 2026 DEPOTEL GROUP · MONITORING · Update Cepat, Data Tepat, Layanan Hebat</p>
        </footer>

        {/* Modals & Dialogs */}
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
            onAddCategory={handleAddNewCategory}
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

        {showInviteModal && (
          <InviteModal
            onClose={() => setShowInviteModal(false)}
            onCreateInvite={handleCreateInvite}
          />
        )}

        {showAccountSettings && currentUser && (
          <AccountSettingsModal
            currentUser={currentUser}
            onClose={() => setShowAccountSettings(false)}
            onUpdateProfile={(updated) => {
              const u = { ...currentUser, ...updated };
              setCurrentUser(u);
              saveSession(u);
              setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
            }}
            onLogout={handleLogout}
          />
        )}

        {/* Edit Category Title & Period Dialog */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 text-slate-800 shadow-2xl">
              <h3 className="font-bold text-lg text-[#1e2238] mb-1">Edit Kategori Update</h3>
              <p className="text-xs text-slate-500 mb-4">Ubah nama judul dan periode operasional</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const title = (form.elements.namedItem('catTitle') as HTMLInputElement).value;
                  const period = (form.elements.namedItem('catPeriod') as HTMLInputElement).value;
                  handleSaveCategoryChanges(title, period);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Judul Kategori
                  </label>
                  <input
                    name="catTitle"
                    defaultValue={editingCategory.title}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Periode
                  </label>
                  <input
                    name="catPeriod"
                    defaultValue={editingCategory.period}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold shadow transition cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteModalState && (
          <ConfirmDeleteModal
            type={deleteModalState.type}
            site={deleteModalState.site}
            category={deleteModalState.category}
            categoryTitle={currentCategory?.title}
            onClose={() => setDeleteModalState(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </PullToRefresh>
  );
}
