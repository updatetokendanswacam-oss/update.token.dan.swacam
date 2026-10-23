import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallPWAButtonProps {
  className?: string;
  variant?: 'primary' | 'compact' | 'outline';
}

export const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({
  className = '',
  variant = 'primary'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already running in standalone PWA mode, display a subtle installed badge or nothing
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Aplikasi Terpasang</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGeneralGuide(true);
    }
  };

  const getButtonStyles = () => {
    if (variant === 'compact') {
      return 'flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer border border-red-500/30';
    }
    if (variant === 'outline') {
      return 'flex items-center gap-2 border border-blue-400/40 text-blue-200 hover:bg-blue-800/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer';
    }
    return 'flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-all cursor-pointer border border-blue-400/30';
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Download dan pasang aplikasi DEPOTEL di HP / Layar Utama"
        className={`${getButtonStyles()} ${className}`}
      >
        <img
          src="/logo.png"
          alt="DEPOTEL"
          className="w-5 h-5 rounded-md object-contain bg-white p-0.5 shadow-xs shrink-0"
        />
        <Download className="w-4 h-4 animate-bounce shrink-0" />
        <span>DOWNLOAD WEB APP</span>
      </button>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-tight">Download Web App DEPOTEL</h3>
                <p className="text-xs text-blue-300 font-medium mt-0.5">Pasang di iPhone / iPad (Safari)</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">1</span>
                <p>Buka tautan DEPOTEL menggunakan browser <strong>Safari</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">2</span>
                <p>Ketuk tombol <strong>Bagikan (Share)</strong> ikon <span className="inline-block px-1.5 py-0.5 bg-slate-700 rounded text-xs">⎋ / [↑]</span> di bilah bawah Safari.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">3</span>
                <p>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">4</span>
                <p>Tekan <strong>Tambah</strong> di pojok kanan atas. Ikon DEPOTEL akan langsung muncul di beranda HP Anda.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Android / Desktop Fallback Guide Modal */}
      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="DEPOTEL" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-tight">Download Web App DEPOTEL</h3>
                <p className="text-xs text-blue-300 font-medium mt-0.5">Android & Komputer</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p><strong>Di Chrome Android:</strong> Ketuk menu titik tiga (⋮) di pojok kanan atas, lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p><strong>Di Laptop/Komputer:</strong> Klik ikon install ⊕ di kolom alamat browser (URL bar) sebelah kanan untuk memasang langsung ke desktop.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGeneralGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
