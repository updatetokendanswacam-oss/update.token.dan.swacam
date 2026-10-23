import React from 'react';
import {
  Home,
  Settings,
  Layers,
  Users,
  CheckCircle2,
  X,
  ChevronRight,
  Shield,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { User, UpdateCategory } from '../types';

interface SidebarProps {
  currentUser: User;
  activeNav: 'dashboard' | 'settings';
  onSelectNav: (tab: 'dashboard' | 'settings') => void;
  categories: UpdateCategory[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  currentUser,
  activeNav,
  onSelectNav,
  categories,
  selectedCategoryId,
  onSelectCategory,
  isOpenMobile = false,
  onCloseMobile,
  onOpenGoogleDrive,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const totalSites = React.useMemo(
    () => categories.reduce((acc, cat) => acc + cat.sites.length, 0),
    [categories]
  );
  const checkedSites = React.useMemo(
    () => categories.reduce((acc, cat) => acc + cat.sites.filter((s) => s.checked).length, 0),
    [categories]
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#181c2e] text-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div
          onClick={() => {
            onSelectNav('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-white/20 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="DEPOTEL GROUP"
              className="w-full h-full object-contain aspect-square"
            />
          </div>
          <div>
            <div className="font-black text-sm tracking-wider uppercase text-white leading-tight">
              DEPOTEL GROUP
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-blue-400">
              MONITORING SYSTEM
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Top Navigation / Categories Quick Access */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <div>
          <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
            Periode Monitoring
          </p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id && activeNav === 'dashboard';
              const catChecked = cat.sites.filter((s) => s.checked).length;
              const catPercent =
                cat.sites.length > 0
                  ? Math.round((catChecked / cat.sites.length) * 100)
                  : 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectNav('dashboard');
                    onSelectCategory(cat.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-center justify-between text-xs cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-600/25 text-blue-200 border border-blue-500/40 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate leading-tight font-medium">{cat.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cat.period}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                      catPercent === 100
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {catPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Drive Integration Quick Access */}
        {onOpenGoogleDrive && (
          <button
            onClick={() => {
              onOpenGoogleDrive();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full p-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white">File Explorer / Drive</p>
                <p className="text-[10px] text-blue-300 font-mono truncate max-w-[130px]">10SRjggSklTu...</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200">
              Sync
            </span>
          </button>
        )}

        {/* Status Operasional Site Ringkas */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ringkasan Lapangan
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total Site:</span>
            <span className="font-bold text-white">{totalSites} Site</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Sudah Diceklis:</span>
            <span className="font-bold text-emerald-400">{checkedSites} Terisi</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{
                width: `${totalSites > 0 ? (checkedSites / totalSites) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FOOTER SIDEBAR: BERANDA & PENGATURAN (VERTikal di Bagian Bawah) */}
      {/* ======================================================== */}
      <div className="mt-auto p-4 border-t border-slate-800/90 bg-[#141726] space-y-1.5">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">
          Menu Utama
        </p>

        {/* 1. Menu Beranda (Ikon Home & Label Beranda) */}
        <button
          onClick={() => {
            onSelectNav('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full px-3.5 py-3 rounded-2xl text-left transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
            activeNav === 'dashboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Home
              className={`w-5 h-5 shrink-0 ${
                activeNav === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-white'
              }`}
            />
            <span>Beranda</span>
          </div>
          {activeNav === 'dashboard' ? (
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {/* 2. Menu Pengaturan (Tetap Nama Pengaturan, diletakkan vertikal di bawah Beranda) */}
        <button
          onClick={() => {
            onSelectNav('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full px-3.5 py-3 rounded-2xl text-left transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
            activeNav === 'settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings
              className={`w-5 h-5 shrink-0 ${
                activeNav === 'settings' ? 'text-white' : 'text-slate-400 group-hover:text-white'
              }`}
            />
            <span>Pengaturan</span>
          </div>
          {activeNav === 'settings' ? (
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {/* Petugas Active Badge */}
        <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="truncate max-w-[130px]">{currentUser.name}</span>
          <span className="text-[10px] uppercase font-bold text-blue-400">
            {isAdmin ? 'Admin' : 'Petugas'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 fixed inset-y-0 left-0 z-30 border-r border-slate-800 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
});
