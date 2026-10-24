import React, { useState, useMemo } from 'react';
import { UserPlus, Plus, Edit2, Trash2, ArrowUpRight, Check, X, Pencil } from 'lucide-react';
import { UpdateCategory, User } from '../types';

interface CategoryCardItemProps {
  category: UpdateCategory;
  isAdmin: boolean;
  onOpenCategory: (categoryId: string) => void;
  onEditCategory: (category: UpdateCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateSiteCount: (categoryId: string, newTotal: number) => void;
}

const CategoryCardItem: React.FC<CategoryCardItemProps> = React.memo(({
  category,
  isAdmin,
  onOpenCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateSiteCount,
}) => {
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [newCountInput, setNewCountInput] = useState<number>(category.sites.length);

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
  const numPercent = useMemo(
    () => (totalSites > 0 ? (checkedSites / totalSites) * 100 : 0),
    [totalSites, checkedSites]
  );

  const isSwacam = category.type === 'swacam';
  const isTokenManual = category.type === 'token_manual';
  const isCustom = category.type === 'custom';
  const badgeText = isSwacam
    ? 'SWACAM / CATAT METER'
    : isTokenManual
    ? 'TOKEN LISTRIK MANUAL'
    : isCustom
    ? (category.customTypeName ? `+ ${category.customTypeName.toUpperCase()}` : '+ KATEGORI KUSTOM')
    : 'TOKEN LISTRIK';

  const handleStartEditCount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setIsEditingCount(true);
    setNewCountInput(category.sites.length);
  };

  const handleSaveCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (newCountInput >= 0) {
      onUpdateSiteCount(category.id, newCountInput);
    }
    setIsEditingCount(false);
  };

  return (
    <div
      onClick={() => onOpenCategory(category.id)}
      className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Card Header: Badge & Actions */}
      <div className="flex items-center justify-between gap-3">
        <span className="px-3 py-1 rounded-lg bg-[#eeeffa] text-[#494c7e] text-[11px] font-bold tracking-wider uppercase">
          {badgeText}
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEditCategory(category)}
                title="Edit Kategori & Periode"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id)}
                title="Hapus Kategori ini"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onOpenCategory(category.id)}
            title="Buka Update"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Sub-period */}
      <div className="mt-3">
        <h3 className="text-lg font-bold text-[#1e2238] group-hover:text-blue-600 transition-colors">
          {category.title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{category.period}</p>
      </div>

      {/* Progress Bar & Submitted Stats */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">Submitted</span>
          <span className="text-blue-600 font-bold">{percentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(numPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Bottom Badges */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
            <Check className="w-3.5 h-3.5" />
            <span>{checkedSites} Terisi</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-slate-400">
            <X className="w-3.5 h-3.5" />
            <span>{uncheckedSites} Belum</span>
          </span>
        </div>

        {/* Edit total site count */}
        {isEditingCount ? (
          <form
            onSubmit={handleSaveCount}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5"
          >
            <input
              type="number"
              min="0"
              value={newCountInput}
              onChange={(e) => setNewCountInput(parseInt(e.target.value, 10) || 0)}
              className="w-16 px-2 py-1 text-xs border border-blue-400 rounded-lg text-center font-bold focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              title="Simpan"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingCount(false)}
              className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
              title="Batal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={handleStartEditCount}
            className={`inline-flex items-center gap-1 font-semibold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 ${
              isAdmin ? 'hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer' : ''
            }`}
            title={isAdmin ? 'Klik untuk mengubah total site' : undefined}
          >
            <span>Total {totalSites} Site</span>
            {isAdmin && <Pencil className="w-3 h-3 text-slate-400 ml-0.5" />}
          </div>
        )}
      </div>
    </div>
  );
});

interface DashboardOverviewProps {
  categories: UpdateCategory[];
  currentUser: User | null;
  onOpenCategory: (categoryId: string) => void;
  onOpenInviteModal: () => void;
  onOpenAddCategoryModal: () => void;
  onEditCategory: (category: UpdateCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateSiteCount: (categoryId: string, newTotal: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(({
  categories,
  currentUser,
  onOpenCategory,
  onOpenInviteModal,
  onOpenAddCategoryModal,
  onEditCategory,
  onDeleteCategory,
  onUpdateSiteCount,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header Section */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
          DEPOTEL · MONITORING
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e2238] tracking-tight">
          Update Token & Swacam
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Tandai setiap site dengan centang bila sudah diisi dan silang bila belum. Persentase
          submitted terhitung otomatis untuk setiap periode.
        </p>

        {/* Action Buttons: Undang user & Periode baru (Hanya Admin) */}
        {isAdmin && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenInviteModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Undang user</span>
            </button>

            <button
              onClick={onOpenAddCategoryModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-sm font-semibold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Periode baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Cards List */}
      <div className="space-y-4 pt-2">
        {categories.map((cat) => (
          <CategoryCardItem
            key={cat.id}
            category={cat}
            isAdmin={isAdmin}
            onOpenCategory={onOpenCategory}
            onEditCategory={onEditCategory}
            onDeleteCategory={onDeleteCategory}
            onUpdateSiteCount={onUpdateSiteCount}
          />
        ))}
      </div>
    </div>
  );
});
