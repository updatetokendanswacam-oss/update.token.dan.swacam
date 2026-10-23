import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { SiteItem, UpdateCategory } from '../types';

interface ConfirmDeleteModalProps {
  type: 'site' | 'category';
  site?: SiteItem | null;
  category?: UpdateCategory | null;
  categoryTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  type,
  site,
  category,
  categoryTitle,
  onClose,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-6 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1e2238]">
              {type === 'site' ? 'Hapus Site dari Daftar?' : 'Hapus Kategori Update?'}
            </h3>
            <p className="text-xs text-slate-500">
              {type === 'site'
                ? `Kategori: ${categoryTitle || 'Update Token / Swacam'}`
                : 'Tindakan ini tidak dapat dibatalkan'}
            </p>
          </div>
        </div>

        {/* Details Card */}
        {type === 'site' && site && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4 my-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">ID Pelanggan / Meter:</span>
              <span className="font-mono font-bold text-slate-800">{site.meterId || '-'}</span>
            </div>
            {site.siteId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Site ID:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {site.siteId}
                </span>
              </div>
            )}
            <div className="text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium block mb-0.5">Nama Site:</span>
              <span className="font-semibold text-slate-800 break-words">{site.siteName}</span>
            </div>
          </div>
        )}

        {type === 'category' && category && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4 my-4 space-y-2">
            <div className="text-xs">
              <span className="text-slate-500 font-medium block mb-0.5">Judul Kategori:</span>
              <span className="font-bold text-slate-800 text-sm">{category.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Periode:</span>
              <span className="font-medium text-slate-700">{category.period}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Jumlah Site:</span>
              <span className="font-bold text-rose-600">{category.sites.length} site terdaftar</span>
            </div>
          </div>
        )}

        {/* Warning Note */}
        <div className="flex items-start gap-2 text-xs text-rose-600/90 bg-rose-50/60 p-3 rounded-xl border border-rose-100/80 mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {type === 'site'
              ? 'Site ini beserta riwayat checklist, nomor token, dan dokumentasi foto akan dihapus permanen.'
              : 'Seluruh site dan data monitoring di dalam kategori ini akan dihapus permanen.'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{type === 'site' ? 'Ya, Hapus Site' : 'Ya, Hapus Kategori'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
