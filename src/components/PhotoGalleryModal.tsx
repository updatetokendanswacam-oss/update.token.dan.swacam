import React, { useState } from 'react';
import { X, Download, Trash2, Shield, Clock, User as UserIcon, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { SiteItem, User, PhotoRecord } from '../types';
import { getPhotoWatermarkBrand } from '../utils/watermark';

interface PhotoGalleryModalProps {
  site: SiteItem;
  initialIndex: number;
  currentUser: User | null;
  onClose: () => void;
  onDeletePhoto: (siteId: string, photoId: string) => Promise<void>;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  site,
  initialIndex,
  currentUser,
  onClose,
  onDeletePhoto,
}) => {
  const photos = site.photos || [];
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialIndex, Math.max(0, photos.length - 1))
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const activePhoto = photos[currentIndex];
  const isAdmin = currentUser?.role === 'admin';

  if (!activePhoto) {
    return null;
  }

  const imageUrl = activePhoto.storageUrl || activePhoto.dataUrl;

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `DEPOTEL_${site.siteId}_${site.meterId}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser) {
      setDeleteNotice('Akses ditolak: Silakan masuk terlebih dahulu untuk menghapus foto.');
      return;
    }

    setIsDeleting(true);
    setDeleteNotice(null);

    try {
      await onDeletePhoto(site.id, activePhoto.id);
      setShowDeleteConfirm(false);
      if (photos.length <= 1) {
        onClose();
      } else {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    } catch (err: any) {
      setDeleteNotice(err?.message || 'Gagal menghapus foto dari database. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {site.siteId}
              </span>
              <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-md">
                {site.siteName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Meter ID: {site.meterId} • Foto {currentIndex + 1} dari {photos.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Unduh Gambar Resmi DEPOTEL"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh Gambar</span>
            </button>

            <button
              onClick={() => {
                setDeleteNotice(null);
                setShowDeleteConfirm(true);
              }}
              title="Hapus foto ini secara permanen"
              className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-800/40 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Hapus</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Viewer */}
        <div className="flex-1 bg-black flex items-center justify-center p-3 relative overflow-hidden min-h-[300px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Dokumentasi Catat Meter ${site.siteId}`}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                // If storageUrl fails or has CORS, fallback to dataUrl if available
                if (activePhoto.dataUrl && (e.currentTarget.src !== activePhoto.dataUrl)) {
                  e.currentTarget.src = activePhoto.dataUrl;
                }
              }}
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <p className="text-sm font-semibold">Foto sedang dimuat dari server...</p>
            </div>
          )}

          {/* Navigation Arrows if multiple photos */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shadow-lg"
              >
                ❮
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shadow-lg"
              >
                ❯
              </button>
            </>
          )}
        </div>

        {/* Footer Info Details */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{activePhoto.formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Petugas: <strong>{activePhoto.capturedBy}</strong></span>
            </div>
            <div className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {getPhotoWatermarkBrand(activePhoto.categoryTitle || activePhoto.categoryType || activePhoto.brandTitle)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Penyimpanan Permanen Cloud (Tanpa Batas Waktu)
          </p>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-red-500/40 p-6 text-center text-slate-100 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Hapus Foto Dokumentasi?</h4>
              {deleteNotice ? (
                <p className="text-xs text-rose-400 mt-2 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                  {deleteNotice}
                </p>
              ) : (
                <p className="text-xs text-slate-300 mt-2">
                  Anda dapat menghapus foto ini secara permanen dari server cloud dan database.
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
