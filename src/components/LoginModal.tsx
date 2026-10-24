import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
  Shield,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface LoginModalProps {
  users: User[];
  inviteCode?: string | null;
  serverErrorMessage?: string | null;
  onLogin: (user: User) => void;
  onGoogleSignIn: () => Promise<void>;
  onRegisterFromInvite?: (name: string, role: UserRole, inviteCode?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  inviteCode,
  serverErrorMessage,
  onLogin,
  onGoogleSignIn,
  onRegisterFromInvite,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningInAdmin, setIsSigningInAdmin] = useState(false);

  // Sync server error message
  useEffect(() => {
    if (serverErrorMessage) {
      setErrorMessage(serverErrorMessage);
    }
  }, [serverErrorMessage]);

  // Invite registration states
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = typedInput.trim();
    if (!clean) {
      setErrorMessage('Harap ketik nama atau email Anda yang terdaftar.');
      return;
    }

    // 1. Check if user exists in the registered database
    const matchedUser = users.find(
      (u) =>
        u.name.trim().toLowerCase() === clean.toLowerCase() ||
        (u.email && u.email.trim().toLowerCase() === clean.toLowerCase())
    );

    if (!matchedUser) {
      setErrorMessage('Akun Anda belum terdaftar. Silakan hubungi Administrator untuk mendapatkan akses.');
      return;
    }

    // 2. Check if account is active
    if (matchedUser.status === 'inactive') {
      setErrorMessage('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator untuk mendapatkan akses.');
      return;
    }

    // 3. Admin cannot bypass authentication by typing name
    if (matchedUser.role === 'admin') {
      setErrorMessage('Akses ditolak. Fitur ini hanya dapat digunakan oleh Administrator. Silakan masuk melalui tombol Masuk Cepat Administrator (Google).');
      return;
    }

    // 4. Authorized registered field officer
    onLogin(matchedUser);
  };

  const handleAdminClick = async () => {
    setErrorMessage(null);
    setIsSigningInAdmin(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Akses ditolak. Fitur ini hanya dapat digunakan oleh Administrator.');
    } finally {
      setIsSigningInAdmin(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    if (onRegisterFromInvite) {
      onRegisterFromInvite(inviteName.trim(), inviteRole, inviteCode || undefined);
    }
  };

  const registeredOfficers = users.filter((u) => u.role === 'user');

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
            Sistem Autentikasi Resmi Petugas Operasional & Administrator
          </p>

          {inviteCode && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Link Undangan Terverifikasi: {inviteCode}</span>
            </div>
          )}
        </div>

        {/* Invite Registration Form (If accessed with verified invite link) */}
        {inviteCode && onRegisterFromInvite ? (
          <form onSubmit={handleRegisterSubmit} className="pt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <p className="font-bold text-xs sm:text-sm text-blue-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Pendaftaran Anggota Tim Baru Melalui Undangan</span>
              </p>
              <p className="text-xs text-blue-700/80 mt-1">
                Ketik nama Anda untuk didaftarkan langsung ke sistem DEPOTEL oleh Administrator.
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
            {/* Prominent Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Login Form for Registered Officers */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Nama Petugas Terdaftar</span>
                  <span className="text-[11px] font-semibold text-blue-600">
                    Khusus Akun Terdaftar
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={typedInput}
                    onChange={(e) => {
                      setTypedInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Ketik nama terdaftar (contoh: Saddam, Kusnaedi)..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50/50 transition-all outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Hanya akun yang telah didaftarkan dan diaktifkan oleh Administrator yang dapat mengakses dashboard.
                </p>
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

            {/* Read-Only Roster of Registered Field Officers */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Daftar Akun Petugas Terdaftar</span>
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {registeredOfficers.length} Petugas
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {registeredOfficers.map((user) => {
                  const isActive = user.status === 'active';
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 select-none text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={user.avatar || '/logo.png'}
                          alt={user.name}
                          className="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                        />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {user.name}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strict Administrator Authentication */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSigningInAdmin}
                onClick={handleAdminClick}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
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
                <span>
                  {isSigningInAdmin
                    ? 'Memverifikasi Administrator...'
                    : 'Masuk Cepat Administrator (Google)'}
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Otorisasi Administrator hanya berlaku untuk akun yang telah diverifikasi di sistem.
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>DEPOTEL Monitoring RBAC Protected</span>
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Terverifikasi</span>
          </span>
        </div>
      </div>
    </div>
  );
};
