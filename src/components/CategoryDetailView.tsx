import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Edit2,
  Plus,
  Check,
  X,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Camera,
  Trash2,
  CornerDownLeft,
  Eye,
  PlusSquare,
  Download,
} from 'lucide-react';
import { UpdateCategory, SiteItem, User } from '../types';

interface CategoryDetailViewProps {
  category: UpdateCategory;
  currentUser: User | null;
  onBackToOverview: () => void;
  onOpenWhatsApp: () => void;
  onEditCategoryTitle: () => void;
  onAddNewSite: () => void;
  onToggleCheck: (siteId: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddToken: (siteId: string, token: string) => void;
  onRemoveToken: (siteId: string, tokenIndex: number) => void;
  onOpenCamera: (site: SiteItem) => void;
  onViewPhoto: (site: SiteItem, photoIndex: number) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  currentUser,
  onBackToOverview,
  onOpenWhatsApp,
  onEditCategoryTitle,
  onAddNewSite,
  onToggleCheck,
  onEditSite,
  onDeleteSite,
  onAddToken,
  onRemoveToken,
  onOpenCamera,
  onViewPhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unchecked' | 'checked'>('all');
  const [activeInputSiteId, setActiveInputSiteId] = useState<string | null>(null);
  const [tokenInputText, setTokenInputText] = useState('');

  const totalSites = category.sites.length;
  const checkedSites = category.sites.filter((s) => s.checked).length;
  const uncheckedSites = totalSites - checkedSites;
  const percentage =
    totalSites > 0
      ? ((checkedSites / totalSites) * 100).toFixed(2).replace('.', ',')
      : '0,00';

  const isSwacam = category.type === 'swacam';
  const badgeText = isSwacam ? 'SWACAM / CATAT METER' : 'TOKEN LISTRIK';
  const isAdmin = currentUser?.role === 'admin';

  // Filtered sites
  const filteredSites = useMemo(() => {
    return category.sites.filter((site) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        site.meterId.toLowerCase().includes(q) ||
        site.siteId.toLowerCase().includes(q) ||
        site.siteName.toLowerCase().includes(q) ||
        (site.tokens && site.tokens.some((t) => t.toLowerCase().includes(q)));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'checked'
          ? site.checked
          : !site.checked;

      return matchesSearch && matchesStatus;
    });
  }, [category.sites, searchQuery, statusFilter]);

  const handleTokenSubmit = (siteId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    const clean = tokenInputText.trim().replace(/^#\s*/, '');
    if (clean) {
      onAddToken(siteId, clean);
      setTokenInputText('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in">
      {/* Top Back Link matching token_2_624887c0.jpeg */}
      <button
        onClick={onBackToOverview}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition active:scale-95 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Semua periode</span>
      </button>

      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-lg bg-[#eeeffa] text-[#494c7e] text-[11px] font-bold tracking-wider uppercase">
            {badgeText}
          </span>
          {!isAdmin && (
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ✓ Izin Akses: Ceklis, Silang & Share WA
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1e2238] tracking-tight">
          {category.title}
        </h1>
        <p className="text-sm text-slate-500 font-medium">{category.period}</p>

        {/* Action Buttons: Kirim WhatsApp (Semua), Edit judul (Admin), + Tambah site (Admin) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {/* Kirim WhatsApp: Terbuka untuk Petugas & Admin */}
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Kirim WhatsApp</span>
          </button>

          {/* Admin Only Actions */}
          {isAdmin && (
            <>
              <button
                onClick={onEditCategoryTitle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-slate-500" />
                <span>Edit judul</span>
              </button>

              <button
                onClick={onAddNewSite}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-sm font-semibold shadow-md transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah site</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Metric Cards Grid (2x2) matching token_2_624887c0.jpeg */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: JUMLAH SITE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>JUMLAH SITE</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e2238]">
            {totalSites}
          </div>
        </div>

        {/* Card 2: SUDAH TERCENTANG */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>SUDAH TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {checkedSites}
          </div>
        </div>

        {/* Card 3: BELUM TERCENTANG */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
            <span>BELUM TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-600">
            {uncheckedSites}
          </div>
        </div>

        {/* Card 4: SUBMITTED */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>SUBMITTED</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e2238]">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Filter Tabs matching token_2_624887c0.jpeg */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-[#1e2238] text-white shadow-sm'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Semua
        </button>

        <button
          onClick={() => setStatusFilter('unchecked')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'unchecked'
              ? 'bg-[#1e2238] text-white shadow-sm'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Belum Tercentang ({uncheckedSites})
        </button>

        <button
          onClick={() => setStatusFilter('checked')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'checked'
              ? 'bg-[#1e2238] text-white shadow-sm'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Sudah Tercentang ({checkedSites})
        </button>
      </div>

      {/* Search Bar matching token_2_624887c0.jpeg */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor, kode, atau nama..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition"
        />
      </div>

      {/* Site Cards List matching token_2_624887c0.jpeg */}
      <div className="space-y-3">
        {filteredSites.length > 0 ? (
          filteredSites.map((site) => {
            const hasTokens = site.tokens && site.tokens.length > 0;
            const isInputOpen = activeInputSiteId === site.id;
            const showCamera = category.allowCamera;

            return (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow transition-all"
              >
                {/* Header Row: Circular toggle, Site identifiers, Edit/Delete icons */}
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Circle Check/Cross Icon */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleCheck(site.id)}
                      title={site.checked ? 'Klik untuk tandai Belum (✕)' : 'Klik untuk tandai Sudah (✓)'}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        site.checked
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 ring-2 ring-emerald-500/20'
                          : 'bg-red-50/80 border border-red-100 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {site.checked ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <X className="w-4 h-4 stroke-[3]" />
                      )}
                    </button>

                    {/* Site Information */}
                    <div className="min-w-0 flex-1">
                      {/* Meter ID & Site ID Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-800">
                          {site.meterId || '-'}
                        </span>
                        {site.siteId && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold font-mono">
                            {site.siteId}
                          </span>
                        )}
                      </div>

                      {/* Site Name */}
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-700 break-words leading-snug">
                        {site.siteName}
                      </p>

                      {/* Token display / Tambah catatan area */}
                      {!isSwacam && (
                        <div className="mt-2">
                          {/* Clean token numbers (No note icon, No #) */}
                          {hasTokens && (
                            <div className="space-y-1 mb-2">
                              {site.tokens!.map((t, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs sm:text-sm font-mono font-semibold text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100"
                                >
                                  <span>{t.replace(/^#\s*/, '')}</span>
                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveToken(site.id, idx);
                                      }}
                                      title="Hapus nomor token ini (Admin)"
                                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition cursor-pointer"
                                      aria-label="Hapus nomor token"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* "Tambah catatan" button or input form (Admin only) */}
                          {isAdmin && (
                            isInputOpen ? (
                              <form
                                onSubmit={(e) => handleTokenSubmit(site.id, e)}
                                className="flex items-center gap-2 mt-1.5"
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={tokenInputText}
                                  onChange={(e) => setTokenInputText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleTokenSubmit(site.id);
                                    }
                                  }}
                                  placeholder="Masukkan nomor token..."
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-blue-500 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none shadow-sm"
                                />
                                <button
                                  type="submit"
                                  title="Tekan Return untuk menyimpan dan pindah baris"
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold transition cursor-pointer"
                                >
                                  <CornerDownLeft className="w-3.5 h-3.5" />
                                  <span>Return</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveInputSiteId(null);
                                    setTokenInputText('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                                >
                                  Batal
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveInputSiteId(site.id);
                                  setTokenInputText('');
                                }}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition font-medium cursor-pointer"
                              >
                                <PlusSquare className="w-3.5 h-3.5" />
                                <span>Tambah catatan</span>
                              </button>
                            )
                          )}
                        </div>
                      )}

                      {/* Camera / Photos Section (for Swacam & Manual Token) */}
                      {showCamera && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Dokumentasi KWh Meter ({site.photos?.length || 0} foto):
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => onOpenCamera(site)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Foto KWh</span>
                              </button>
                            )}
                          </div>

                          {/* Thumbnails */}
                          {site.photos && site.photos.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                              {site.photos.map((photo, pIdx) => (
                                <div
                                  key={photo.id || pIdx}
                                  onClick={() => onViewPhoto(site, pIdx)}
                                  className="relative group shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-100"
                                >
                                  <img
                                    src={photo.dataUrl}
                                    alt="Foto Meter"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <Eye className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Edit & Delete Icons (Admin Only) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSite(site);
                        }}
                        title="Edit data site"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Edit site"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSite(site.id);
                        }}
                        title={`Hapus site ${site.siteId || site.siteName}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer"
                        aria-label="Hapus site"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-slate-200 text-slate-500 text-sm">
            Tidak ada site yang cocok dengan pencarian / filter.
          </div>
        )}
      </div>
    </div>
  );
};
