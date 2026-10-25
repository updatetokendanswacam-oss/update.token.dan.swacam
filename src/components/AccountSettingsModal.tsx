import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Upload, LogOut, Check, AlertTriangle, Save, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { InstallPWAButton } from './InstallPWAButton';

interface AccountSettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<User>) => Promise<void>;
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
  const [nameInput, setNameInput] = useState(currentUser.name);

  // Status states
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    const cleanName = nameInput.trim();
    if (!cleanName || cleanName.length < 2) {
      setNameError('Nama profil minimal harus 2 karakter.');
      return;
    }

    if (cleanName === currentUser.name) {
      setNameSuccess('Nama profil sudah sesuai.');
      setTimeout(() => setNameSuccess(null), 3000);
      return;
    }

    setIsSavingName(true);
    try {
      await onUpdateProfile({ name: cleanName });
      setNameSuccess('Nama profil berhasil disimpan permanen ke database!');
      setTimeout(() => setNameSuccess(null), 3500);
    } catch (err: any) {
      setNameError(err?.message || 'Gagal menyimpan nama ke database. Silakan coba lagi.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(null);
    setIsSavingAvatar(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      try {
        await onUpdateProfile({ avatar: result });
        setAvatarSuccess('Foto profil berhasil disimpan ke database!');
        setTimeout(() => setAvatarSuccess(null), 3500);
      } catch (err: any) {
        setAvatarError(err?.message || 'Gagal menyimpan foto profil ke database.');
        setAvatarPreview(currentUser.avatar || '/logo.png');
      } finally {
        setIsSavingAvatar(false);
      }
    };
    reader.onerror = () => {
      setAvatarError('Gagal membaca berkas gambar.');
      setIsSavingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToLogo = async () => {
    setAvatarError(null);
    setAvatarSuccess(null);
    setIsSavingAvatar(true);
    setAvatarPreview('/logo.png');
    try {
      await onUpdateProfile({ avatar: '/logo.png' });
      setAvatarSuccess('Foto profil dikembalikan ke logo DEPOTEL!');
      setTimeout(() => setAvatarSuccess(null), 3500);
    } catch (err: any) {
      setAvatarError(err?.message || 'Gagal menyimpan perubahan ke database.');
      setAvatarPreview(currentUser.avatar || '/logo.png');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Pengaturan Akun & Profil</h3>
              <p className="text-xs text-slate-500">Edit nama dan identitas resmi pengguna</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="my-4 space-y-4 overflow-y-auto pr-1">
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
                disabled={isSavingAvatar}
                title="Ganti Foto Profil"
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer disabled:opacity-0"
              >
                {isSavingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
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
                disabled={isSavingAvatar}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSavingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isSavingAvatar ? 'Menyimpan...' : 'Ganti Foto'}</span>
              </button>
              <button
                onClick={handleResetToLogo}
                disabled={isSavingAvatar}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                Logo DEPOTEL
              </button>
            </div>

            {avatarSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{avatarSuccess}</span>
              </p>
            )}

            {avatarError && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{avatarError}</span>
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

          {/* Edit Name Form */}
          <form onSubmit={handleSaveName} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nama Profil / Nama Tampilan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (nameError) setNameError(null);
                    if (nameSuccess) setNameSuccess(null);
                  }}
                  disabled={isSavingName}
                  placeholder="Ketik nama baru Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Nama ini disimpan permanen ke database dan digunakan pada semua modul Token & SWACAM.
              </p>
            </div>

            {nameSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{nameSuccess}</span>
              </div>
            )}

            {nameError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{nameError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingName || !nameInput.trim() || nameInput.trim().length < 2 || nameInput.trim() === currentUser.name}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSavingName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Perubahan Nama</span>
                </>
              )}
            </button>
          </form>

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
          <div className="pt-1">
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
