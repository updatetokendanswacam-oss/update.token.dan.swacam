import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Upload, LogOut, Check, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { InstallPWAButton } from './InstallPWAButton';

interface AccountSettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<User>) => void;
  onLogout: (forgetDevice?: boolean) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  currentUser,
  onClose,
  onUpdateProfile,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '/logo.png');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      onUpdateProfile({ avatar: result });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToLogo = () => {
    setAvatarPreview('/logo.png');
    onUpdateProfile({ avatar: '/logo.png' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Pengaturan Akun & Profil</h3>
              <p className="text-xs text-slate-500">Kelola identitas dan sesi akun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="my-5 space-y-5 overflow-y-auto pr-1">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="relative group mb-3">
              <img
                src={avatarPreview}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Ganti Foto Profil"
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-base font-bold text-[#1e2238]">{currentUser.name}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {currentUser.role === 'admin' ? 'Administrator' : 'Petugas Lapangan'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {currentUser.email || 'Akun Terdaftar Langsung'}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto</span>
              </button>
              <button
                onClick={handleResetToLogo}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs cursor-pointer shadow-xs"
              >
                Logo DEPOTEL
              </button>
            </div>

            {isSaved && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                <Check className="w-3.5 h-3.5" />
                <span>Foto profil diperbarui!</span>
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* PWA Install Area */}
          <div className="p-4 rounded-2xl bg-[#eeeffa] border border-[#e2e4f7] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1e2238]">Download Web App DEPOTEL</p>
                <p className="text-[11px] text-slate-500">Pasang langsung ke layar utama HP</p>
              </div>
            </div>
            <InstallPWAButton variant="compact" />
          </div>

          {/* Logout Section */}
          <div className="pt-2">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white border border-red-200 p-6 text-center text-slate-800 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#1e2238]">Konfirmasi Keluar</h4>
              <p className="text-xs text-slate-600 mt-2">
                Apakah Anda yakin ingin keluar dari akun <strong>{currentUser.name}</strong>? Data pekerjaan yang telah diinput tetap aman tersimpan.
              </p>
              <div className="flex flex-col gap-2 mt-5">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  Keluar (Tetap Ingat Akun di HP Ini)
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout(true);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Ganti Akun / Hapus dari Perangkat Ini
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
