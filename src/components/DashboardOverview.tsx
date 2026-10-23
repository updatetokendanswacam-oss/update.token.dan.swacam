import React, { useState } from 'react';
import { UserPlus, Plus, Edit2, Trash2, ArrowUpRight, Check, X, Pencil } from 'lucide-react';
import { UpdateCategory, User } from '../types';

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

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  categories,
  currentUser,
  onOpenCategory,
  onOpenInviteModal,
  onOpenAddCategoryModal,
  onEditCategory,
  onDeleteCategory,
  onUpdateSiteCount,
}) => {
  const [editingCountCatId, setEditingCountCatId] = useState<string | null>(null);
  const [newCountInput, setNewCountInput] = useState<number>(0);

  const isAdmin = currentUser?.role === 'admin';

  const handleStartEditCount = (cat: UpdateCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingCountCatId(cat.id);
    setNewCountInput(cat.sites.length);
  };

  const handleSaveCount = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (newCountInput >= 0) {
      onUpdateSiteCount(catId, newCountInput);
    }
    setEditingCountCatId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header Section matching token__91aaac5f.jpeg */}
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
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

      {/* Category Cards List matching token__91aaac5f.jpeg */}
      <div className="space-y-4 pt-2">
        {categories.map((cat) => {
          const totalSites = cat.sites.length;
          const checkedSites = cat.sites.filter((s) => s.checked).length;
          const uncheckedSites = totalSites - checkedSites;
          const percentage =
            totalSites > 0
              ? ((checkedSites / totalSites) * 100).toFixed(2).replace('.', ',')
              : '0,00';

          const isSwacam = cat.type === 'swacam';
          const badgeText = isSwacam ? 'SWACAM / CATAT METER' : 'TOKEN LISTRIK';

          return (
            <div
              key={cat.id}
              onClick={() => onOpenCategory(cat.id)}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
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
                        onClick={() => onEditCategory(cat)}
                        title="Edit Kategori & Periode"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        title="Hapus Kategori ini"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onOpenCategory(cat.id)}
                    title="Buka Update"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 transition cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Sub-period */}
              <div className="mt-3">
                <h3 className="text-lg font-bold text-[#1e2238] group-hover:text-blue-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{cat.period}</p>
              </div>

              {/* Big Percentage */}
              <div className="mt-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1e2238] tracking-tight">
                  {percentage}%
                </span>
              </div>

              {/* Counts & Pills Row */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  {editingCountCatId === cat.id ? (
                    <form
                      onSubmit={(e) => handleSaveCount(cat.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5"
                    >
                      <span>{checkedSites} dari</span>
                      <input
                        type="number"
                        min="0"
                        value={newCountInput}
                        onChange={(e) => setNewCountInput(parseInt(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 border border-blue-500 rounded text-center text-xs font-bold text-slate-800"
                        autoFocus
                      />
                      <span>site tercentang</span>
                      <button
                        type="submit"
                        className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                      >
                        OK
                      </button>
                    </form>
                  ) : (
                    <span className="flex items-center gap-1 font-medium">
                      <span>{checkedSites} dari</span>
                      <strong className="text-slate-800 font-bold">{totalSites} site</strong>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleStartEditCount(cat, e)}
                          title="Klik untuk mengubah jumlah site di menu monitoring"
                          className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span>tercentang</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{checkedSites}</span>
                  </span>
                  <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{uncheckedSites}</span>
                  </span>
                </div>
              </div>

              {/* Divider & Bottom "Buka update ↗" */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e2238] group-hover:text-blue-600 transition-colors">
                <span>Buka update</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
