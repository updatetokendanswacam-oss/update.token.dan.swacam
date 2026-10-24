import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Search, CheckCircle2, UserPlus, ArrowRight, Sparkles } from 'lucide-react';

interface LoginModalProps {
  users: User[];
  inviteCode?: string | null;
  onLogin: (user: User) => void;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (onRegisterFromInvite) {
      onRegisterFromInvite(newName.trim(), newRole, inviteCode || undefined);
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
            Pilih akun petugas atau masuk dengan Google untuk memulai pencatatan dan monitoring
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
                Masukkan nama Anda untuk langsung terdaftar dalam sistem monitoring DEPOTEL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Petugas
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Ahmad Rizki"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran Akun
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
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
              <span>Bergabung & Mulai Bekerja</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <>
            {/* Primary Action: Google Sign In */}
            <div className="pt-5 pb-3">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs hover:shadow transition active:scale-98 cursor-pointer group"
              >
                <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
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
                <span>Masuk dengan Akun Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                atau pilih akun terdaftar
              </span>
            </div>

            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama petugas atau admin..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70 text-slate-800"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ada petugas dengan nama "{searchTerm}"
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onLogin(user)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 transition active:scale-98 cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={user.avatar || '/logo.png'}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              user.isOnline !== false ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.email || (isAdmin ? 'updatetokendanswacam@gmail.com' : 'Petugas Lapangan')}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Petugas</span>
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
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
