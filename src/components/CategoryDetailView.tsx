import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Edit2,
  Plus,
  Check,
  X,
  Search,
  Layers,
  TrendingUp,
  Camera,
  Trash2,
  CornerDownLeft,
  Eye,
  PlusSquare,
  ChevronDown
} from 'lucide-react';
import { UpdateCategory, SiteItem, User } from '../types';

interface SiteItemCardProps {
  site: SiteItem;
  isAdmin: boolean;
  isSwacam: boolean;
  showCamera: boolean;
  onToggleCheck: (siteId: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddToken: (siteId: string, token: string) => void;
  onRemoveToken: (siteId: string, tokenIndex: number) => void;
  onOpenCamera: (site: SiteItem) => void;
  onViewPhoto: (site: SiteItem, photoIndex: number) => void;
}

const SiteItemCard: React.FC<SiteItemCardProps> = React.memo(({
  site,
  isAdmin,
  isSwacam,
  showCamera,
  onToggleCheck,
  onEditSite,
  onDeleteSite,
  onAddToken,
  onRemoveToken,
  onOpenCamera,
  onViewPhoto,
}) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [tokenInputText, setTokenInputText] = useState('');

  const hasTokens = site.tokens && site.tokens.length > 0;

  const handleTokenSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tokenInputText.trim().replace(/^#\s*/, '');
    if (clean) {
      onAddToken(site.id, clean);
      setTokenInputText('');
      setIsInputOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow transition-shadow">
      {/* Header Row: Circular toggle, Site identifiers, Edit/Delete icons */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Circle Check/Cross Icon */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggleCheck(site.id)}
            title={site.checked ? 'Klik untuk tandai Belum (✕)' : 'Klik untuk tandai Sudah (✓)'}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0 ${
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
            {/* Meter ID & Site ID Tag & Checked By */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-bold text-slate-800">
                {site.meterId || '-'}
              </span>
              {site.siteId && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold font-mono">
                  {site.siteId}
                </span>
              )}
              {site.checked && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                  ✓ {site.checkedBy || site.updatedBy || 'Petugas'}
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
                {/* Clean token numbers */}
                {hasTokens && (
                  <div className="space-y-1 mb-2">
                    {site.tokens!.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs sm:text-sm font-mono font-semibold text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100"
                      >
                        <span>{t.replace(/^#\s*/, '')}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveToken(site.id, idx);
                          }}
                          title="Hapus nomor token ini"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition cursor-pointer"
                          aria-label="Hapus nomor token"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* "Tambah catatan" button or input form */}
                {isInputOpen ? (
                  <form
                    onSubmit={handleTokenSubmit}
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
                          handleTokenSubmit();
                        }
                      }}
                      placeholder="Masukkan nomor token..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-blue-500 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none shadow-xs"
                    />
                    <button
                      type="submit"
                      title="Simpan nomor token"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold transition cursor-pointer"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputOpen(false);
                        setTokenInputText('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsInputOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition font-medium cursor-pointer"
                  >
                    <PlusSquare className="w-3.5 h-3.5" />
                    <span>Tambah catatan</span>
                  </button>
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
                  <button
                    type="button"
                    onClick={() => onOpenCamera(site)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Foto KWh</span>
                  </button>
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
                          src={photo.storageUrl || photo.dataUrl}
                          alt="Foto Meter"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            if (photo.dataUrl && e.currentTarget.src !== photo.dataUrl) {
                              e.currentTarget.src = photo.dataUrl;
                            }
                          }}
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

        {/* Right: Edit & Delete Icons */}
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
      </div>
    </div>
  );
});

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

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = React.memo(({
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
  const [displayLimit, setDisplayLimit] = useState(35);

  const totalSites = category.sites.length;
  const checkedSites = useMemo(
    () => category.sites.filter((s) => s.checked).length,
    [category.sites]
  );
  const uncheckedSites = totalSites - checkedSites;
  const percentage = useMemo(
    () => (totalSites > 0 ? ((checkedSites / totalSites) * 100).toFixed(2).replace('.', ',') : '0,00'),
    [totalSites, checkedSites]
  );

  const isSwacam = category.type === 'swacam';
  const isNeteco = category.type === 'neteco_unmon' || category.title.toLowerCase().includes('neteco');
  const badgeText = isNeteco ? 'LIST NETECO UNMON' : (isSwacam ? 'SWACAM / CATAT METER' : 'TOKEN LISTRIK');
  const isAdmin = currentUser?.role === 'admin';

  // Filtered sites with memoization
  const filteredSites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return category.sites.filter((site) => {
      const matchesSearch =
        !q ||
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

  // Sliced items for smooth progressive rendering
  const visibleSites = useMemo(() => {
    return filteredSites.slice(0, displayLimit);
  }, [filteredSites, displayLimit]);

  const hasMore = filteredSites.length > displayLimit;

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + 35);
  }, []);

  const handleShowAll = useCallback(() => {
    setDisplayLimit(filteredSites.length);
  }, [filteredSites.length]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in">
      {/* Top Back Link */}
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
          {/* Kirim WhatsApp */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Kirim WhatsApp</span>
          </button>

          {/* Edit judul */}
          <button
            type="button"
            onClick={onEditCategoryTitle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
            <span>Edit judul</span>
          </button>

          {/* Admin Only Actions */}
          {isAdmin && (
            <button
              type="button"
              onClick={onAddNewSite}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-sm font-semibold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah site</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: JUMLAH SITE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>JUMLAH SITE</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e2238]">
            {totalSites}
          </div>
        </div>

        {/* Card 2: SUDAH TERCENTANG */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>SUDAH TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {checkedSites}
          </div>
        </div>

        {/* Card 3: BELUM TERCENTANG */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
            <span>BELUM TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-500">
            {uncheckedSites}
          </div>
        </div>

        {/* Card 4: SUBMITTED */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>SUBMITTED</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e2238]">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
        <button
          onClick={() => {
            setStatusFilter('all');
            setDisplayLimit(35);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-[#1e2238] text-white shadow-xs'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Semua
        </button>

        <button
          onClick={() => {
            setStatusFilter('unchecked');
            setDisplayLimit(35);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'unchecked'
              ? 'bg-[#1e2238] text-white shadow-xs'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Belum Tercentang ({uncheckedSites})
        </button>

        <button
          onClick={() => {
            setStatusFilter('checked');
            setDisplayLimit(35);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            statusFilter === 'checked'
              ? 'bg-[#1e2238] text-white shadow-xs'
              : 'bg-[#f0f2f8] hover:bg-[#e4e7f2] text-slate-600'
          }`}
        >
          Sudah Tercentang ({checkedSites})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDisplayLimit(35);
          }}
          placeholder="Cari nomor, kode, atau nama..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs transition"
        />
      </div>

      {/* Site Cards List */}
      <div className="space-y-3">
        {visibleSites.length > 0 ? (
          <>
            {visibleSites.map((site) => (
              <SiteItemCard
                key={site.id}
                site={site}
                isAdmin={isAdmin}
                isSwacam={isSwacam}
                showCamera={category.allowCamera}
                onToggleCheck={onToggleCheck}
                onEditSite={onEditSite}
                onDeleteSite={onDeleteSite}
                onAddToken={onAddToken}
                onRemoveToken={onRemoveToken}
                onOpenCamera={onOpenCamera}
                onViewPhoto={onViewPhoto}
              />
            ))}

            {/* Progressive Loading Controls */}
            {hasMore && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Muat 35 Site Lagi (Tampil {visibleSites.length} dari {filteredSites.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleShowAll}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 py-2 px-3 transition cursor-pointer"
                >
                  Tampilkan Semua ({filteredSites.length} site)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-slate-200 text-slate-500 text-sm">
            Tidak ada site yang cocok dengan pencarian / filter.
          </div>
        )}
      </div>
    </div>
  );
});
