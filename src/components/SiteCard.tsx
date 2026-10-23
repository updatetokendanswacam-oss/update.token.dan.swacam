import React, { useState } from 'react';
import { Check, X, Camera, Edit2, Trash2, Plus, CornerDownLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { SiteItem, UpdateCategory, User } from '../types';

interface SiteCardProps {
  site: SiteItem;
  category: UpdateCategory;
  currentUser: User | null;
  onToggleCheck: (siteId: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddToken: (siteId: string, token: string) => void;
  onRemoveToken: (siteId: string, tokenIndex: number) => void;
  onOpenCamera: (site: SiteItem) => void;
  onViewPhoto: (site: SiteItem, photoIndex: number) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  category,
  currentUser,
  onToggleCheck,
  onEditSite,
  onDeleteSite,
  onAddToken,
  onRemoveToken,
  onOpenCamera,
  onViewPhoto,
}) => {
  const [newTokenInput, setNewTokenInput] = useState('');
  const [isAddingToken, setIsAddingToken] = useState(false);

  const isSwacam = category.type === 'swacam';
  const showCamera = category.allowCamera;
  const showTokens = category.allowTokenInput && !isSwacam;

  const handleAddTokenSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = newTokenInput.trim().replace(/^#\s*/, ''); // hilangkan tanda # jika ada
    if (cleanToken) {
      onAddToken(site.id, cleanToken);
      setNewTokenInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTokenSubmit();
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        site.checked
          ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-950/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Main Header Row: Checkbox, Site Info, Actions */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Check Toggle & Identifiers */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Centang / Silang Toggle Button */}
            <button
              onClick={() => onToggleCheck(site.id)}
              title={site.checked ? 'Klik untuk tandai Belum (❌)' : 'Klik untuk tandai Sudah (✅)'}
              className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer shadow-md ${
                site.checked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/50'
                  : 'bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/40 hover:border-red-400'
              }`}
            >
              {site.checked ? (
                <Check className="w-5 h-5 stroke-[3]" />
              ) : (
                <X className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>

            {/* Site Name and Details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 text-blue-300 border border-blue-900/40">
                  {site.meterId || '-'}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                  {site.siteId || '-'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    site.checked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {site.checked ? 'SUDAH' : 'BELUM'}
                </span>
              </div>

              <h4 className="mt-1 text-sm sm:text-base font-bold text-white break-words leading-snug">
                {site.siteName}
              </h4>
            </div>
          </div>

          {/* Right Action Icons: Edit & Delete */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditSite(site)}
              title="Edit Data Site"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteSite(site.id)}
              title="Hapus Site dari List"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tokens Section (Only for token categories, never shown on swacam) */}
        {showTokens && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                No Token Listrik:
              </span>
              {!isAddingToken && (
                <button
                  onClick={() => setIsAddingToken(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah No Token</span>
                </button>
              )}
            </div>

            {/* List of Token Numbers (Clean: No Note Logo, No #) */}
            {site.tokens && site.tokens.length > 0 ? (
              <div className="space-y-1.5">
                {site.tokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-mono text-emerald-400 font-semibold group"
                  >
                    <span className="tracking-wider select-all">{token}</span>
                    <button
                      onClick={() => onRemoveToken(site.id, idx)}
                      title="Hapus nomor token ini"
                      className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingToken && (
                <p className="text-xs text-slate-400 italic">Belum ada nomor token diinput.</p>
              )
            )}

            {/* Add Token Input with Return Button */}
            {isAddingToken && (
              <form onSubmit={handleAddTokenSubmit} className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newTokenInput}
                  onChange={(e) => setNewTokenInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Ketik nomor token (misal: 0694-0057-9935...)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-blue-500 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
                />
                {/* Return Button to add and move line */}
                <button
                  type="submit"
                  title="Tekan Return untuk menyimpan nomor token dan pindah baris"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Return</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTokenInput('');
                    setIsAddingToken(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs cursor-pointer"
                >
                  Batal
                </button>
              </form>
            )}
          </div>
        )}

        {/* Camera / Photo Documentation Section (For Swacam and Manual Token categories) */}
        {showCamera && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dokumentasi Foto KWh Meter / Bukti:</span>
              </span>

              {/* Take Photo Button */}
              <button
                onClick={() => onOpenCamera(site)}
                title="Ambil foto atau upload gambar KWh meter"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ambil / Upload Foto</span>
              </button>
            </div>

            {/* Photo thumbnails with timestamp and preview */}
            {site.photos && site.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {site.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    onClick={() => onViewPhoto(site, idx)}
                    className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer aspect-video"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Foto Site ${site.siteId}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                      <p className="text-[9px] font-bold text-yellow-300 truncate">
                        {photo.formattedTime || 'Dokumentasi'}
                      </p>
                      <div className="flex items-center justify-between text-[8px] text-slate-300">
                        <span className="truncate">{photo.capturedBy}</span>
                        <Eye className="w-3 h-3 text-blue-300 shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-xs text-slate-400">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Belum ada foto. Ketuk tombol kamera untuk mendokumentasikan catat meter.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
