import React from 'react';
import { RotateCw, UserPlus, Users, ShieldCheck, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onOpenUserManagement: () => void;
  onOpenInviteModal: () => void;
  onOpenLogoutModal: () => void;
  onRefresh: () => void;
  onToggleMobileSidebar?: () => void;
  isRefreshing: boolean;
  onSelectNav?: (tab: 'dashboard' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenUserManagement,
  onOpenInviteModal,
  onOpenLogoutModal,
  onRefresh,
  onToggleMobileSidebar,
  isRefreshing,
  onSelectNav,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-20 bg-[#1e2238] text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Hamburger (mobile) & Brand */}
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onSelectNav && onSelectNav('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 border border-white/10 group-hover:bg-white/20 transition">
              <img
                src="/logo.png"
                alt="DEPOTEL"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base tracking-wider uppercase text-white leading-tight">
                DEPOTEL GROUP
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-blue-300">
                MONITORING
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Segarkan Data"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Admin Specific Action Buttons */}
          {isAdmin && (
            <>
              <button
                onClick={onOpenInviteModal}
                title="Undang Anggota Tim Baru"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 text-blue-100 text-xs font-bold transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undang</span>
              </button>

              <button
                onClick={onOpenUserManagement}
                title="Kelola Daftar Pengguna"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Kelola Tim</span>
              </button>
            </>
          )}

          {/* User Profile Pill */}
          <button
            onClick={onOpenLogoutModal}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer group"
          >
            {currentUser.avatar && currentUser.avatar !== '/logo.png' ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-white/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black uppercase text-white shadow-inner">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden xs:block">
              <div className="text-xs font-bold text-white max-w-[90px] truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[9px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-0.5">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5 text-yellow-400" />
                    <span>Admin</span>
                  </>
                ) : (
                  <span>Petugas</span>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
