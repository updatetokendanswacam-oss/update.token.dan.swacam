import React from 'react';
import { LayoutDashboard, Settings, UserCog, UserPlus, LogOut, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { InstallPWAButton } from './InstallPWAButton';

interface HeaderProps {
  currentUser: User | null;
  activeNav: 'dashboard' | 'settings';
  onSelectNav: (nav: 'dashboard' | 'settings') => void;
  onOpenUserManagement: () => void;
  onOpenInviteModal: () => void;
  onOpenLogoutModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeNav,
  onSelectNav,
  onOpenUserManagement,
  onOpenInviteModal,
  onOpenLogoutModal,
  onRefresh,
  isRefreshing = false,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectNav('dashboard')}
            className="flex items-center gap-3 min-w-0 cursor-pointer select-none"
          >
            <img
              src="/logo.png"
              alt="DEPOTEL GROUP"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-white p-0.5 border border-slate-200 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-widest text-red-600 uppercase block leading-none">
                DEPOTEL GROUP
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#1e2238] tracking-tight truncate block leading-tight">
                MONITORING
              </span>
            </div>
          </div>

          {/* Center Navigation Switcher (Dashboard vs Pengaturan) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => onSelectNav('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#1e2238] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onSelectNav('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#1e2238] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Segarkan Data"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* PWA Install */}
            <InstallPWAButton variant="compact" className="hidden md:flex" />

            {/* Invite (Admin Only) */}
            {isAdmin && (
              <button
                onClick={onOpenInviteModal}
                title="Undang Anggota Tim"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Undang</span>
              </button>
            )}

            {/* Admin Kelola Pengguna shortcut */}
            {isAdmin && (
              <button
                onClick={onOpenUserManagement}
                title="Kelola Pengguna & Hak Akses"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eeeffa] hover:bg-[#e2e4f7] text-[#494c7e] text-xs font-bold transition cursor-pointer"
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Kelola User</span>
              </button>
            )}

            {/* User Profile */}
            {currentUser && (
              <button
                onClick={() => onSelectNav('settings')}
                title="Buka Pengaturan Akun"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatar || '/logo.png'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
              </button>
            )}

            {/* Logout Shortcut */}
            <button
              onClick={onOpenLogoutModal}
              title="Keluar (Logout)"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
