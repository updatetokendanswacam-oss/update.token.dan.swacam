import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallNotification: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already running inside standalone PWA mode, don't show the notification
  if (isInstalled) {
    return null;
  }

  const handleDownloadClick = async () => {
    if (isInstallable) {
      const result = await install();
      if (result) {
        setIsDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGeneralGuide(true);
    }
  };

  return (
    <>
      {/* Floating Download Notification Banner */}
      {!isDismissed ? (
        <aside
          aria-label="Notifikasi Download Web App DEPOTEL"
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-45 bg-[#141726]/95 backdrop-blur-md border border-blue-500/40 text-white p-4 rounded-3xl shadow-2xl shadow-blue-950/50 animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-start gap-3.5">
            {/* DEPOTEL Circular Logo Badge */}
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-white/80 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="DEPOTEL GROUP"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                  <span>Aplikasi Resmi</span>
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Download Web App DEPOTEL
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Pasang di layar utama HP Anda agar akses pengisian token dan dokumentasi foto lebih cepat & offline.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/40 active:scale-95 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>Download / Pasang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </div>

            {/* Dismiss Cross Button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Tutup notifikasi download"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      ) : (
        /* Minimized Floating Trigger Pill so user can reopen whenever they want */
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          title="Buka Notifikasi Download Web App DEPOTEL"
          className="fixed bottom-20 lg:bottom-6 right-4 z-40 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-3.5 py-2 rounded-full shadow-xl border border-blue-400/40 flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
          </div>
          <span className="hidden xs:inline">Download Web App</span>
          <Download className="w-3.5 h-3.5 animate-bounce" />
        </button>
      )}

      {/* iOS Installation Guide Modal with DEPOTEL Logo */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#141726] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3.5 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Download Web App DEPOTEL
                </h3>
                <p className="text-xs text-blue-300 font-medium mt-0.5">
                  Pasang di iPhone / iPad (Safari)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  1
                </span>
                <p>
                  Buka aplikasi DEPOTEL menggunakan browser <strong>Safari</strong> di iPhone/iPad Anda.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  2
                </span>
                <p>
                  Ketuk tombol <strong>Bagikan (Share)</strong> ikon{' '}
                  <span className="inline-block px-1.5 py-0.5 bg-slate-700 rounded text-xs">⎋ / [↑]</span>{' '}
                  pada bilah navigasi Safari.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  3
                </span>
                <p>
                  Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  4
                </span>
                <p>
                  Tekan <strong>Tambah</strong> di pojok kanan atas. Ikon DEPOTEL resmi akan langsung muncul di beranda HP Anda.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md transition cursor-pointer"
            >
              Mengerti & Siap Pasang
            </button>
          </div>
        </div>
      )}

      {/* Android & Desktop Guide Modal with DEPOTEL Logo */}
      {showGeneralGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#141726] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3.5 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Download Web App DEPOTEL
                </h3>
                <p className="text-xs text-blue-300 font-medium mt-0.5">
                  Android & Komputer
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Di HP Android:</strong> Buka menu Chrome (titik tiga ⋮ di pojok kanan atas), lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Di Laptop/Desktop:</strong> Klik ikon install ⊕ di ujung bilah alamat URL browser sebelah kanan untuk memasang langsung ke desktop.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGeneralGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md transition cursor-pointer"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
