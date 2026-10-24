import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { syncUserProfile } from '../utils/firestoreService';
import { User as UserType } from '../types';
import { CheckCircle2, Shield, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

interface LoginModalProps {
  inviteCode?: string | null;
  onLoginSuccess: (user: UserType) => void;
  onShowToast: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  inviteCode,
  onLoginSuccess,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const verifiedUser = await syncUserProfile(result.user);
      onShowToast(`Selamat datang, ${verifiedUser.name}!`);
      onLoginSuccess(verifiedUser);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Jendela login ditutup sebelum proses selesai.');
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMessage('Koneksi internet bermasalah. Periksa jaringan Anda.');
      } else {
        setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (displayName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
          });
        }
        const verifiedUser = await syncUserProfile(userCredential.user);
        onShowToast(`Pendaftaran berhasil. Selamat datang, ${verifiedUser.name}!`);
        onLoginSuccess(verifiedUser);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const verifiedUser = await syncUserProfile(userCredential.user);
        onShowToast(`Selamat datang kembali, ${verifiedUser.name}!`);
        onLoginSuccess(verifiedUser);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Email atau kata sandi tidak sesuai.');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMessage('Kata sandi yang Anda masukkan salah.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Email ini sudah terdaftar. Silakan pilih tab "Masuk".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Format email tidak valid.');
      } else {
        setErrorMessage(err.message || 'Terjadi kesalahan saat otentikasi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-slate-800 my-auto">
        {/* Brand Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="inline-flex p-2.5 rounded-3xl bg-white shadow-lg border border-slate-200/90 mb-3">
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
          <p className="text-xs text-slate-500 mt-1">
            Autentikasi Akun Resmi Petugas & Administrator
          </p>

          {inviteCode && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Undangan Terverifikasi: {inviteCode}</span>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Primary Action: Google Sign In */}
        <div className="pt-5 pb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>Masuk dengan Akun Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            atau dengan Email & Password
          </span>
        </div>

        {/* Auth Mode Toggle Tabs (Masuk / Daftar) */}
        <div className="flex rounded-xl bg-slate-100 p-1 my-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama petugas lapangan..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@depotel.id"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Shield className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {authMode === 'register' ? 'Daftar & Masuk' : 'Masuk ke Sistem'}
            </span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Autentikasi terenkripsi & tersertifikasi Firebase</span>
        </div>
      </div>
    </div>
  );
};
