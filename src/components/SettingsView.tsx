import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Shield,
  Upload,
  UserPlus,
  UserCog,
  Download,
  FileSpreadsheet,
  Database,
  Smartphone,
  LogOut,
  RotateCw,
  AlertTriangle,
  RotateCcw,
  Layers,
  HardDrive
} from 'lucide-react';
import { User, UpdateCategory, InviteLink } from '../types';
import { InstallPWAButton } from './InstallPWAButton';
import { TeamStatusRoster } from './TeamStatusRoster';

interface SettingsViewProps {
  currentUser: User;
  users: User[];
  categories: UpdateCategory[];
  invites: InviteLink[];
  onUpdateProfile: (updated: Partial<User>) => void;
  onOpenUserManagement: () => void;
  onOpenInviteModal: () => void;
  onOpenExportModal: () => void;
  onOpenAddCategoryModal: () => void;
  onOpenGoogleDrive?: () => void;
  onLogout: (forgetDevice?: boolean) => void;
  onResetData: () => void;
  onRefresh: () => void;
  onSwitchUser?: (user: User) => void;
  onCheckForUpdate?: () => void;
  isCheckingUpdate?: boolean;
  isRefreshing?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = React.memo(({
  currentUser,
  users,
  categories,
  invites,
  onUpdateProfile,
  onOpenUserManagement,
  onOpenInviteModal,
  onOpenExportModal,
  onOpenAddCategoryModal,
  onOpenGoogleDrive,
  onLogout,
  onResetData,
  onRefresh,
  onSwitchUser,
  onCheckForUpdate,
  isCheckingUpdate = false,
  isRefreshing = false,
}) => {
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '/logo.png');
  const [isSaved, setIsSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      onUpdateProfile({ avatar: result });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToLogo = () => {
    setAvatarPreview('/logo.png');
    onUpdateProfile({ avatar: '/logo.png' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Backup data to JSON file
  const handleExportBackup = () => {
    const backupData = {
      categories,
      users,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEPOTEL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in">
      {/* Header Pengaturan */}
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
          DEPOTEL · PENGATURAN
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1e2238] tracking-tight">
          Pengaturan Aplikasi & Akun
        </h1>
        <p className="text-sm text-slate-500">
          Kelola profil, pengguna, pencadangan data, serta konfigurasi operasional.
        </p>
      </div>

      {/* Role Notification Banner for Regular Users */}
      {!isAdmin && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3.5 shadow-xs animate-in fade-in">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold uppercase tracking-wider text-amber-900 text-xs">
              Hak Akses: Akun Petugas Lapangan (User)
            </p>
            <p className="mt-1 text-amber-800/90 leading-relaxed text-xs">
              Akun Anda memiliki hak akses operasional untuk melakukan{' '}
              <strong className="text-emerald-700">Ceklis (✓)</strong>,{' '}
              <strong className="text-red-600">Silang (✕)</strong>, dan{' '}
              <strong className="text-slate-900">Bagikan Hasil Update ke WhatsApp</strong>.
              Pengeditan data site, penambahan/penghapusan data master, dan pengaturan tim dibatasi
              khusus untuk <strong>Administrator</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Profil Akun Anda */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-[#1e2238] flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-blue-600" />
          <span>Profil Pengguna</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
          <div className="relative group shrink-0">
            <img
              src={avatarPreview}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-white"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Ganti Foto Profil"
              className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-lg font-extrabold text-[#1e2238]">{currentUser.name}</h4>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isAdmin ? 'Administrator' : 'Petugas Lapangan'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {currentUser.email || 'Akun Terdaftar di Perangkat Ini'}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Ganti Foto
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleResetToLogo}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
              >
                Gunakan Logo DEPOTEL
              </button>
              {isSaved && (
                <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">
                  ✓ Foto profil diperbarui
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Kelola Tim & Link Undangan */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#1e2238] flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Tim & Tautan Undangan</span>
          </h3>
          {!isAdmin && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200">
              Khusus Admin
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Atur anggota yang terdaftar, perbarui status hak akses, dan bagikan link akses ke WhatsApp.
        </p>

        {isAdmin ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onOpenUserManagement}
              className="p-4 rounded-2xl bg-[#eeeffa] hover:bg-[#e4e6f7] border border-[#e2e4f7] text-left transition flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-white text-[#494c7e] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1e2238]">Kelola Pengguna ({users.length})</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambah, edit profil, nonaktifkan, atau hapus anggota tim.
                </p>
              </div>
            </button>

            <button
              onClick={onOpenInviteModal}
              className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 text-left transition flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-950">Buat Link Undangan Tim</p>
                <p className="text-xs text-emerald-700/80 mt-0.5">
                  Kirim link resmi ke rekan via WhatsApp untuk akses langsung di HP manapun.
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Pengaturan data tim dan pembuatan link undangan dibatasi hanya untuk Administrator.</span>
            </span>
          </div>
        )}
      </div>

      {/* Status Tim Terdaftar (Live Roster - Khusus di Halaman Pengaturan) */}
      <TeamStatusRoster users={users} />

      {/* Section 3: Pengaturan Periode & Data */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-[#1e2238] flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-purple-600" />
          <span>Pengelolaan Periode & Pencadangan Data</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          {isAdmin
            ? 'Tambah periode baru, unduh rekapitulasi ke Excel, dan cadangkan data operasional.'
            : 'Unduh laporan rekapitulasi operasional dan pencadangan data.'}
        </p>

        <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
          {isAdmin && (
            <button
              onClick={onOpenAddCategoryModal}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-left transition cursor-pointer"
            >
              <Layers className="w-5 h-5 text-[#1e2238] mb-2" />
              <p className="font-bold text-xs sm:text-sm text-[#1e2238]">+ Periode Baru</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tambah jenis checklist/periode</p>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-left transition cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="font-bold text-xs sm:text-sm text-[#1e2238]">Ekspor ke Excel (.CSV)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Unduh data tabel laporan site</p>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-left transition cursor-pointer"
          >
            <Download className="w-5 h-5 text-blue-600 mb-2" />
            <p className="font-bold text-xs sm:text-sm text-[#1e2238]">Backup Data JSON</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cadangkan seluruh basis data</p>
          </button>

          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className="p-4 rounded-2xl border border-blue-200/90 bg-blue-50/60 hover:bg-blue-100/60 text-left transition cursor-pointer group"
            >
              <HardDrive className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-blue-950">File Explorer & Google Drive</p>
              <p className="text-[11px] text-blue-700 mt-0.5 truncate font-mono">ID: 10SRjggSklTu...</p>
            </button>
          )}
        </div>

        {/* Reset Demo Data Button (Admin Only) */}
        {isAdmin && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700">Atur Ulang Data Demo</p>
              <p className="text-[11px] text-slate-400">Kembalikan daftar site dan user ke data bawaan awal</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        )}
      </div>

      {/* Section 4: Download Web App DEPOTEL (PWA) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1e2238] flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span>Download Aplikasi Web DEPOTEL (PWA)</span>
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            Aplikasi Resmi
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Pasang DEPOTEL langsung ke layar utama Android, iPhone, tablet, maupun laptop tanpa perlu membuka browser berulang kali.
        </p>

        {/* Card Download Web App with DEPOTEL Logo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#eeeffa] border border-[#e2e4f7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="DEPOTEL GROUP"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#1e2238]">DEPOTEL GROUP - UPDATE TOKEN & SWACAM</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Mendukung mode standalone native HP, akses offline, dan penyimpanan foto GPS permanen.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto shrink-0 flex justify-end">
            <InstallPWAButton variant="primary" />
          </div>
        </div>
      </div>

      {/* Section 5: Status Pembaruan WebApp & Sinkronisasi Vercel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1e2238] flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-blue-600" />
            <span>Pembaruan Otomatis WebApp (Vercel)</span>
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            Live Deployment
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Sistem secara otomatis mendeteksi setiap rilis pembaruan baru dari Vercel tanpa perlu menghapus cache secara manual.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#1e2238] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Sinkronisasi Otomatis Vercel Aktif</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Setiap perubahan kode yang dideploy ke Vercel langsung disajikan ke browser pengguna tanpa cache tertahan.
            </p>
          </div>
          {onCheckForUpdate && (
            <button
              type="button"
              onClick={onCheckForUpdate}
              disabled={isCheckingUpdate}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdate ? 'Memeriksa...' : 'Periksa Pembaruan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 6: Keluar Akun */}
      <div className="bg-white rounded-3xl border border-red-100 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Akhiri sesi aktif Anda atau ganti ke akun lain pada perangkat ini.
            </p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow transition cursor-pointer"
          >
            Keluar (Logout)
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
              Pilih apakah Anda ingin keluar sesi sementara (tetap ingat akun) atau ingin mengganti akun di HP ini:
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

      {/* Reset Data Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-red-200 p-6 text-center text-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-[#1e2238]">Atur Ulang Data?</h4>
            <p className="text-xs text-slate-600 mt-2">
              Tindakan ini akan mengembalikan daftar site dan periode kembali ke data default awal.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition cursor-pointer"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
