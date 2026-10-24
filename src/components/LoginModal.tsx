import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { getNameLoginCount, getLoginCounts, getSavedOfficerNames } from '../utils/storage';
import {
  Shield,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  Clock,
  Info
} from 'lucide-react';

interface LoginModalProps {
  users: User[];
  inviteCode?: string | null;
  onLogin: (typedName: string) => void;
  onGoogleSignIn: () => void;
  onRegisterFromInvite?: (name: string, role: UserRole, inviteCode?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  inviteCode,
  onLogin,
  onGoogleSignIn,
  onRegisterFromInvite,
}) => {
  const [typedName, setTypedName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invite registration states
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');

  // Real-time login count for current typed name
  const currentCount = useMemo(() => {
    return getNameLoginCount(typedName);
  }, [typedName]);

  const allCounts = useMemo(() => {
    return getLoginCounts();
  }, [typedName]);

  const savedOfficerNames = useMemo(() => {
    return getSavedOfficerNames();
  }, [typedName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = typedName.trim();
    if (!clean) {
      setErrorMessage('Harap ketik nama Anda terlebih dahulu.');
      return;
    }

    if (clean.length < 2) {
      setErrorMessage('Nama minimal terdiri dari 2 karakter.');
      return;
    }

    onLogin(clean);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    if (onRegisterFromInvite) {
      onRegisterFromInvite(inviteName.trim(), inviteRole, inviteCode || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-slate-800 my-auto animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="inline-flex p-3 rounded-3xl bg-white shadow-lg border border-slate-200/90 mb-3.5">
            <img
              src="/logo.png"
              alt="DEPOTEL GROUP"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain aspect-square"
            />
          </div>
          <p className="text-[11px] font-black tracking-widest text-red-600 uppercase">
            DEPOTEL GROUP · MONITORING
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-[#1e2238] tracking-tight mt-0.5">
            UPDATE TOKEN & SWACAM
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ketik nama Anda untuk masuk ke sistem dashboard operasional
          </p>

          {inviteCode && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Link Undangan Aktif: {inviteCode}</span>
            </div>
          )}
        </div>

        {/* Invite Registration Form (If accessed with ?invite=CODE) */}
        {inviteCode && onRegisterFromInvite ? (
          <form onSubmit={handleRegisterSubmit} className="pt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <p className="font-bold text-xs sm:text-sm text-blue-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Pendaftaran Anggota Tim Baru</span>
              </p>
              <p className="text-xs text-blue-700/80 mt-1">
                Ketik nama Anda untuk didaftarkan langsung ke sistem DEPOTEL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ketik Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Contoh: Ahmad Rizki"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran Akun
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50"
              >
                <option value="user">Petugas Lapangan (User)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Daftar & Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="pt-5 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Typing Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Ketik Nama Anda untuk Masuk</span>
                  <span className="text-[11px] font-medium text-slate-400 lowercase">
                    (wajib ketik nama)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={typedName}
                    onChange={(e) => {
                      setTypedName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Ketik nama lengkap atau nama panggilan..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50/50 transition-all outline-none"
                  />
                </div>

                {/* Real-time 3x Save Status Banner */}
                {typedName.trim() ? (
                  <div className="mt-2.5 p-3 rounded-2xl border transition-all text-xs">
                    {currentCount >= 3 ? (
                      <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border-emerald-200 p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">✓ Nama Tersimpan Permanen!</p>
                          <p className="text-[11px] text-emerald-700/90 mt-0.5">
                            Nama "{typedName.trim()}" telah masuk {currentCount}x dan resmi tersimpan di sistem ini.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-900 bg-blue-50/80 border-blue-200 p-2 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span>Progres Simpan Otomatis:</span>
                            <span className="text-blue-700">{currentCount} / 3x masuk</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-blue-200/70 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (currentCount / 3) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-blue-700/80 mt-1">
                            {currentCount === 0
                              ? 'Masuk 3x dengan nama yang sama untuk otomatis tersimpan permanen.'
                              : currentCount === 1
                              ? 'Ketik nama ini 2x lagi saat masuk berikutnya untuk simpan permanen.'
                              : 'Tinggal 1x masuk lagi agar nama Anda tersimpan permanen!'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      Aturan Sistem: Ketik nama Anda dan masuk <strong>3x berturut-turut</strong> agar nama otomatis tersimpan permanen.
                    </span>
                  </div>
                )}
              </div>

              {/* Enter Dashboard Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1e2238] hover:bg-[#2c3254] text-white font-bold text-sm sm:text-base shadow-lg shadow-slate-900/10 transition active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </form>

            {/* Read-Only Informational Roster (CANNOT be clicked per instructions) */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Daftar Petugas & Status Simpan (Ketik untuk Masuk)</span>
                </p>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Hanya Ketik
                </span>
              </div>

              {/* Informational Cards - Read Only (Non-clickable) */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {users.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const norm = user.name.trim().toLowerCase();
                  const count = allCounts[norm] || (isAdmin ? 3 : 0);
                  const isSaved = count >= 3 || savedOfficerNames.some((n) => n.toLowerCase() === norm);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 select-none text-left cursor-default"
                      title="Ketik nama ini pada kolom di atas untuk masuk"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar || '/logo.png'}
                          alt={user.name}
                          className="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {isAdmin ? 'Administrator' : 'Petugas Lapangan'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Tersimpan (≥3x)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <span>{count}/3x masuk</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Google Sign In */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Cepat Administrator (Google)</span>
              </button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Sistem Monitoring Checklist & SWACAM</span>
          </span>
          <span>Versi 2.0</span>
        </div>
      </div>
    </div>
  );
};
