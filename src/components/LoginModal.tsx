import React, { useState } from 'react';
import { Search, ArrowRight, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import { User as UserType } from '../types';
import { loadRememberedUser, clearRememberedUser } from '../utils/storage';

interface LoginModalProps {
  users: UserType[];
  inviteCode?: string | null;
  onLogin: (user: UserType) => void;
  onGoogleSignIn: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  inviteCode,
  onLogin,
  onGoogleSignIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rememberedAccount, setRememberedAccount] = useState<UserType | null>(() =>
    loadRememberedUser()
  );
  const [showAllNames, setShowAllNames] = useState(!rememberedAccount);

  const activeUsers = users.filter((u) => u.status === 'active');
  const filteredUsers = activeUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectName = (u: UserType) => {
    onLogin(u);
  };

  const handleClearSavedAccount = () => {
    clearRememberedUser();
    setRememberedAccount(null);
    setShowAllNames(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fc] p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8 text-slate-800 my-auto">
        {/* Brand Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-md border border-slate-200 mb-2">
            <img
              src="/logo.png"
              alt="DEPOTEL GROUP"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
          <p className="text-[11px] font-black tracking-widest text-red-600 uppercase">
            DEPOTEL GROUP · MONITORING
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-[#1e2238] tracking-tight mt-0.5">
            UPDATE TOKEN & SWACAM
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aplikasi Operasional DEPOTEL
          </p>

          {inviteCode && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Undangan Aktif: {inviteCode}</span>
            </div>
          )}
        </div>

        {/* Remembered / Saved Account Card (Instant 1-Click Login) */}
        {rememberedAccount && !showAllNames ? (
          <div className="py-5 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-[#eeeffa] border border-[#e2e4f7] text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-2">
                ✓ Akun Tersimpan di HP Ini
              </span>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={rememberedAccount.avatar || '/logo.png'}
                  alt={rememberedAccount.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mb-2 bg-white"
                />
                <h3 className="text-lg font-extrabold text-[#1e2238]">
                  {rememberedAccount.name}
                </h3>
                <span className="text-xs text-slate-500 mt-0.5 font-medium">
                  {rememberedAccount.role === 'admin' ? 'Administrator' : 'Petugas Lapangan'}
                </span>
                {rememberedAccount.email && (
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {rememberedAccount.email}
                  </p>
                )}
              </div>

              {/* Instant Login Button */}
              <button
                onClick={() => handleSelectName(rememberedAccount)}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Masuk Langsung sebagai {rememberedAccount.name}</span>
              </button>
            </div>

            {/* Switch user option */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Bukan {rememberedAccount.name}?</span>
              <button
                onClick={() => setShowAllNames(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
              >
                Pilih Nama Lain
              </button>
            </div>
          </div>
        ) : (
          /* Normal Selection Flow: Google Sign In or Pick From Registered Names */
          <>
            {/* Google Sign-in Option */}
            <div className="py-4 border-b border-slate-100">
              <button
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Masuk dengan Google (HP / Browser)</span>
              </button>
              <div className="flex items-center gap-3 my-3.5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Atau Pilih Nama Anda (Otomatis Tersimpan)
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>

            {/* Member Selector */}
            <div className="pt-2">
              <div className="relative mb-2.5">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama Anda (Saddam, Kusnaedi, Budiman...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role === 'admin';
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectName(u)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-[#eeeffa] border border-slate-200/80 hover:border-[#494c7e]/30 transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || '/logo.png'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-[#1e2238] group-hover:text-blue-700">
                                {u.name}
                              </span>
                              {isAdmin ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-100 text-amber-800">
                                  Admin
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-blue-100 text-blue-800">
                                  Petugas
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {u.email || 'Simpan akun otomatis'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                          <span className="text-xs font-semibold hidden sm:inline">Pilih</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    Nama tidak ditemukan.
                  </div>
                )}
              </div>
            </div>

            {rememberedAccount && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowAllNames(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  ← Kembali ke akun tersimpan ({rememberedAccount.name})
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            🔒 Saat Anda mengeklik nama Anda, akun akan langsung tersimpan secara permanen di perangkat ini sehingga Anda tidak perlu memilih nama lagi pada kunjungan berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
};
