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
import {
  User,
  UpdateCategory,
  SiteItem,
  PhotoRecord,
  UserRole,
  InviteLink,
} from './types';
import { INITIAL_CATEGORIES, INITIAL_USERS } from './utils/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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
import { Home, Settings } from 'lucide-react';

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

  // Sync state changes with persistence
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveInvites(invites);
  }, [invites]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setCategories(loadCategories());
    setUsers(loadUsers());
    setIsRefreshing(false);
    showToast('Data berhasil diperbarui');
  };

  // Find currently open category
  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // User Authentication Handlers
  const handleSelectUser = (user: User) => {
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

  const handleLogout = (forgetDevice = false) => {
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
  const handleOpenCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
  };

  // Site Check/Uncheck action
  const handleToggleCheck = (siteId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        const updatedSites = cat.sites.map((site) => {
          if (site.id !== siteId) return site;
          const nextChecked = !site.checked;
          return {
            ...site,
            checked: nextChecked,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Petugas',
          };
        });

        return {
          ...cat,
          sites: updatedSites,
        };
      })
    );
  };

  // Token Management
  const handleAddToken = (siteId: string, token: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        const updatedSites = cat.sites.map((site) => {
          if (site.id !== siteId) return site;
          const currentTokens = site.tokens || [];
          return {
            ...site,
            tokens: [...currentTokens, token],
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Petugas',
          };
        });

        return {
          ...cat,
          sites: updatedSites,
        };
      })
    );
    showToast(`Token listrik berhasil ditambahkan`);
  };

  const handleRemoveToken = (siteId: string, tokenIndex: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        const updatedSites = cat.sites.map((site) => {
          if (site.id !== siteId) return site;
          const currentTokens = site.tokens || [];
          return {
            ...site,
            tokens: currentTokens.filter((_, idx) => idx !== tokenIndex),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'Petugas',
          };
        });

        return {
          ...cat,
          sites: updatedSites,
        };
      })
    );
  };

  // Photo Watermarking & IndexedDB Storage
  const handleSavePhoto = async (siteId: string, photo: PhotoRecord) => {
    try {
      await savePhotoToDB(photo);

      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id !== selectedCategoryId) return cat;

          const updatedSites = cat.sites.map((site) => {
            if (site.id !== siteId) return site;
            const existingPhotos = site.photos || [];
            return {
              ...site,
              photos: [...existingPhotos, photo],
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.name || 'Petugas',
            };
          });

          return {
            ...cat,
            sites: updatedSites,
          };
        })
      );

      setCameraSite(null);
      showToast('Foto dokumentasi tersimpan dengan watermark GPS');
    } catch (err) {
      console.error('Failed to save photo record:', err);
      showToast('Gagal menyimpan foto dokumentasi');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhotoFromDB(photoId);

      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id !== selectedCategoryId) return cat;

          const updatedSites = cat.sites.map((site) => {
            if (!site.photos) return site;
            return {
              ...site,
              photos: site.photos.filter((p) => p.id !== photoId),
            };
          });

          return {
            ...cat,
            sites: updatedSites,
          };
        })
      );

      setViewingPhoto(null);
      showToast('Foto berhasil dihapus');
    } catch (err) {
      console.error('Failed to delete photo:', err);
      showToast('Gagal menghapus foto');
    }
  };

  // Site Edit & Add
  const handleEditSite = (site: SiteItem) => {
    setEditingSite(site);
  };

  const handleSaveEditedSite = (updatedSite: SiteItem) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: cat.sites.map((s) => (s.id === updatedSite.id ? updatedSite : s)),
        };
      })
    );
    setEditingSite(null);
    showToast(`Data site ${updatedSite.siteId} berhasil diperbarui`);
  };

  const handleAddSite = (siteData: { meterId: string; siteId: string; siteName: string }) => {
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

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          sites: [...cat.sites, newSite],
        };
      })
    );

    setShowAddSiteModal(false);
    showToast(`Site ${newSite.siteId} berhasil ditambahkan ke daftar`);
  };

  const handleDeleteSite = (siteId: string) => {
    const siteToDelete = currentCategory?.sites.find((s) => s.id === siteId);
    if (!siteToDelete) return;
    setDeleteModalState({
      type: 'site',
      site: siteToDelete,
    });
  };

  const handleEditCategory = (cat: UpdateCategory) => {
    setEditingCategory(cat);
  };

  const handleUpdateSiteCount = (categoryId: string, newTotal: number) => {
    setCategories((prev) =>
      prev.map((cat) => {
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
            sites: [...cat.sites, additionalSites as unknown as SiteItem],
          };
        }
      })
    );
    showToast(`Total site berhasil disesuaikan menjadi ${newTotal}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const catToDelete = categories.find((c) => c.id === categoryId);
    if (!catToDelete) return;
    setDeleteModalState({
      type: 'category',
      category: catToDelete,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState) return;

    if (deleteModalState.type === 'site' && deleteModalState.site) {
      const siteId = deleteModalState.site.id;
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== selectedCategoryId) return cat;
          return {
            ...cat,
            sites: cat.sites.filter((s) => s.id !== siteId),
          };
        })
      );
      showToast(`Site ${deleteModalState.site.siteId} dihapus`);
    } else if (deleteModalState.type === 'category' && deleteModalState.category) {
      const catId = deleteModalState.category.id;
      setCategories((prev) => {
        const remaining = prev.filter((c) => c.id !== catId);
        if (selectedCategoryId === catId && remaining.length > 0) {
          setSelectedCategoryId(remaining[0].id);
        }
        return remaining;
      });
      showToast(`Kategori "${deleteModalState.category.title}" dihapus`);
    }

    setDeleteModalState(null);
  };

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
    setInvites((prev) => [newInvite, ...prev]);
    showToast(`Tautan undangan kode ${newInvite.code} berhasil dibuat`);
    return newInvite;
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
        onLogin={handleSelectUser}
        onGoogleSignIn={() => {
          const firstAdmin = users.find((u) => u.role === 'admin') || users[0];
          if (firstAdmin) handleSelectUser(firstAdmin);
        }}
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
        />

        {/* Right Content Area with responsive offset for Sidebar */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
          {/* Top Header (Dashboard & Pengaturan removed from top center per instructions) */}
          <Header
            currentUser={currentUser}
            onOpenUserManagement={() => setShowUserManagement(true)}
            onOpenInviteModal={() => setShowInviteModal(true)}
            onOpenLogoutModal={() => setShowAccountSettings(true)}
            onToggleMobileSidebar={() => setIsOpenMobileSidebar(true)}
            onRefresh={handleRefresh}
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
            {/* Status Tim Terdaftar (Live Roster) */}
            <TeamStatusRoster users={users} />

            {/* Conditional rendering between Beranda (Dashboard) and Pengaturan (Settings) */}
            {activeNav === 'dashboard' ? (
              viewMode === 'overview' ? (
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
                onOpenUserManagement={() => setShowUserManagement(true)}
                onOpenInviteModal={() => setShowInviteModal(true)}
                onOpenExportModal={() => setShowExportModal(true)}
                onOpenAddCategoryModal={() => setShowAddCategoryModal(true)}
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
            onAddCategory={(cat) => {
              setCategories((prev) => [...prev, cat]);
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
      </div>
    </PullToRefresh>
  );
}
