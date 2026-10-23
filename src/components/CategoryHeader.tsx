import React, { useState } from 'react';
import { Edit3, CheckCircle2, XCircle, BarChart3, PlusCircle, Share2, FileSpreadsheet, Layers, Sparkles } from 'lucide-react';
import { UpdateCategory } from '../types';

interface CategoryHeaderProps {
  category: UpdateCategory;
  onUpdateTitleAndPeriod: (title: string, period: string) => void;
  onOpenWhatsApp: () => void;
  onOpenExport: () => void;
  onAddNewSite: () => void;
  onAddNewCategory: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  onUpdateTitleAndPeriod,
  onOpenWhatsApp,
  onOpenExport,
  onAddNewSite,
  onAddNewCategory,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(category.title);
  const [periodInput, setPeriodInput] = useState(category.period);

  const totalSites = category.sites.length;
  const checkedSites = category.sites.filter(s => s.checked).length;
  const uncheckedSites = totalSites - checkedSites;
  const percentage = totalSites > 0 ? ((checkedSites / totalSites) * 100).toFixed(2).replace('.', ',') : '0,00';

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateTitleAndPeriod(titleInput.trim(), periodInput.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Title & Period with Edit button */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-blue-500 text-white font-bold text-lg sm:text-xl focus:outline-none"
                  placeholder="Nama Kategori Update..."
                />
                <input
                  type="text"
                  value={periodInput}
                  onChange={(e) => setPeriodInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-sm focus:outline-none"
                  placeholder="Periode (misal: Bulan September 2026)"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Simpan Judul
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(category.title);
                    setPeriodInput(category.period);
                    setIsEditingTitle(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {category.title}
                  </h2>
                  <button
                    onClick={() => {
                      setTitleInput(category.title);
                      setPeriodInput(category.period);
                      setIsEditingTitle(true);
                    }}
                    title="Edit Nama dan Periode Kategori"
                    className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                    {category.period}
                  </span>
                  <span className="text-xs text-slate-400">
                    Sistem Update Operasional DEPOTEL
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: WhatsApp, Export, Add Site, Add Category */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Share Button */}
          <button
            onClick={onOpenWhatsApp}
            title="Sandingkan dan Kirim ke WhatsApp"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim ke WhatsApp</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            title="Ekspor ke Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ekspor</span>
          </button>

          {/* Add Site Button */}
          <button
            onClick={onAddNewSite}
            title="Tambah Site Baru ke Daftar Ini"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Site</span>
          </button>

          {/* Add New Category Button */}
          <button
            onClick={onAddNewCategory}
            title="Tambah Kategori Update Baru Selain Token & Swacam"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">+ Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        {/* Card 1: Jumlah Tiket Site */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Jumlah Tiket Site</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalSites}</span>
            <span className="text-xs text-slate-400 font-medium">Site</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total seluruh site terdaftar</p>
        </div>

        {/* Card 2: Sudah Tercentang */}
        <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sudah Tercentang</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{checkedSites}</span>
            <span className="text-xs text-emerald-300/80 font-medium">Site ✅</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">Status sukses terverifikasi</p>
        </div>

        {/* Card 3: Belum Tercentang */}
        <div className="bg-red-950/25 border border-red-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-red-500/50 transition">
          <div className="flex items-center justify-between text-red-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Belum Tercentang</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-400">{uncheckedSites}</span>
            <span className="text-xs text-red-300/80 font-medium">Site ❌</span>
          </div>
          <p className="text-[11px] text-red-400/80 mt-1">Menunggu pengisian & update</p>
        </div>

        {/* Card 4: Persentase Submitted */}
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/50 transition">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300">{percentage}%</span>
            <span className="text-xs text-blue-300/80 font-medium">📊 Progres</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (checkedSites / (totalSites || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
