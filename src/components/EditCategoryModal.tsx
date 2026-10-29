import React, { useState } from 'react';
import { X, Layers, Save, Calendar, PenLine, ListFilter, Plus } from 'lucide-react';
import { UpdateCategory } from '../types';

interface EditCategoryModalProps {
  category: UpdateCategory;
  onClose: () => void;
  onSaveCategory: (updatedCategory: UpdateCategory) => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  onClose,
  onSaveCategory,
}) => {
  const [title, setTitle] = useState(category.title);
  const [period, setPeriod] = useState(category.period);
  const [type, setType] = useState<'token' | 'swacam' | 'token_manual' | 'neteco_unmon' | 'standby_team' | 'custom'>(category.type || 'token');
  const [isCustomMode, setIsCustomMode] = useState(category.type === 'custom');
  const [customTypeName, setCustomTypeName] = useState(category.customTypeName || '');
  const [allowCamera, setAllowCamera] = useState(category.allowCamera);
  const [allowTokenInput, setAllowTokenInput] = useState(category.allowTokenInput);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedTitle = title.trim();
    if (!resolvedTitle) {
      setErrorMessage('Judul / Nama Kategori wajib diisi.');
      return;
    }

    const resolvedType = isCustomMode ? 'custom' : type;

    const updatedCategory: UpdateCategory = {
      ...category,
      title: resolvedTitle,
      period: period.trim() || category.period,
      type: resolvedType,
      customTypeName: isCustomMode && customTypeName.trim() ? customTypeName.trim() : undefined,
      allowCamera: resolvedType === 'custom' ? allowCamera : (resolvedType === 'swacam' || resolvedType === 'token_manual' || resolvedType === 'neteco_unmon'),
      allowTokenInput: resolvedType === 'custom' ? allowTokenInput : (resolvedType === 'token' || resolvedType === 'token_manual'),
    };

    setIsSaving(true);
    try {
      await onSaveCategory(updatedCategory);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan perubahan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Edit Judul & Periode Kategori</h3>
              <p className="text-xs text-slate-500">Perbarui nama dan periode monitoring site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* 1. Nama / Judul Kategori Update */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Judul / Nama Kategori Update
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Update Swacam/Catat Meter – DEPOTEL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 transition"
              required
            />
          </div>

          {/* 2. Periode */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Periode Kategori</span>
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Contoh: 23–27 Oktober 2026 atau Bulan Oktober 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              required
            />
          </div>

          {/* 3. Jenis Kategori */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                JENIS KATEGORI
              </label>

              <button
                type="button"
                onClick={() => {
                  const nextState = !isCustomMode;
                  setIsCustomMode(nextState);
                  if (nextState) {
                    setType('custom');
                    setAllowTokenInput(true);
                    setAllowCamera(true);
                  } else {
                    setType(category.type !== 'custom' ? category.type : 'token');
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isCustomMode ? (
                  <>
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Pilih Opsi Standar</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Kategori Kustom</span>
                  </>
                )}
              </button>
            </div>

            {isCustomMode ? (
              <div className="space-y-2 animate-in fade-in">
                <div className="relative">
                  <input
                    type="text"
                    value={customTypeName}
                    onChange={(e) => setCustomTypeName(e.target.value)}
                    placeholder="Ketik jenis kategori lain..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-blue-500 bg-blue-50/20 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                  <div className="absolute left-3 top-3 text-blue-600 pointer-events-none">
                    <PenLine className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as any;
                  if (val === 'custom') {
                    setIsCustomMode(true);
                    setType('custom');
                    setAllowCamera(true);
                    setAllowTokenInput(true);
                    return;
                  }
                  setType(val);
                  setIsCustomMode(false);
                  if (val === 'token') {
                    setAllowCamera(false);
                    setAllowTokenInput(true);
                  } else if (val === 'token_manual') {
                    setAllowCamera(true);
                    setAllowTokenInput(true);
                  } else if (val === 'swacam') {
                    setAllowCamera(true);
                    setAllowTokenInput(false);
                  } else if (val === 'neteco_unmon') {
                    setAllowCamera(true);
                    setAllowTokenInput(false);
                  } else if (val === 'standby_team') {
                    setAllowCamera(true);
                    setAllowTokenInput(false);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition bg-white"
              >
                <option value="swacam">Swacam / Catat Meter (Kamera KWh Meter)</option>
                <option value="token">Token Listrik (Hanya No. Token)</option>
                <option value="token_manual">Token Listrik Manual (No. Token & Kamera Dokumentasi)</option>
                <option value="neteco_unmon">List NETECO UNMON Eastern JABO (48 Site)</option>
                <option value="standby_team">Jadwal Standby Team MBP (Jadwal & Petugas Standby)</option>
                <option value="custom">Kategori Kustom...</option>
              </select>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
