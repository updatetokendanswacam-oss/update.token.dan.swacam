import React, { useState } from 'react';
import { X, Layers, PlusCircle, Calendar, Plus, PenLine, ListFilter } from 'lucide-react';
import { UpdateCategory } from '../types';

interface AddCategoryModalProps {
  onClose: () => void;
  onAddCategory: (category: UpdateCategory) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  onClose,
  onAddCategory,
}) => {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('Bulan Oktober 2026');
  const [type, setType] = useState<'token' | 'swacam' | 'token_manual' | 'custom'>('token');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [allowCamera, setAllowCamera] = useState(false);
  const [allowTokenInput, setAllowTokenInput] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedTitle = title.trim() || (isCustomMode && customTypeName.trim() ? `${customTypeName.trim()} – DEPOTEL` : '');
    if (!resolvedTitle) {
      setErrorMessage('Nama Kategori Update atau Jenis Kategori wajib diisi');
      return;
    }

    const resolvedType = isCustomMode ? 'custom' : type;

    const newCategory: UpdateCategory = {
      id: `cat-${Date.now()}`,
      title: resolvedTitle,
      period: period.trim() || 'Bulan Oktober 2026',
      type: resolvedType,
      customTypeName: isCustomMode && customTypeName.trim() ? customTypeName.trim() : undefined,
      sites: [],
      allowCamera: resolvedType === 'custom' ? allowCamera : (resolvedType === 'swacam' || resolvedType === 'token_manual'),
      allowTokenInput: resolvedType === 'custom' ? allowTokenInput : (resolvedType === 'token' || resolvedType === 'token_manual'),
    };

    onAddCategory(newCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Tambah Periode / Kategori Baru</h3>
              <p className="text-xs text-slate-500">Buat periode atau jenis checklist baru</p>
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

          {/* 1. Nama Kategori Update */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Kategori Update
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengisian Token Listrik SWFM – DEPOTEL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              required
            />
          </div>

          {/* 2. Periode */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Periode</span>
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Contoh: Bulan Oktober 2026 atau 23–27 Oktober 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              required
            />
          </div>

          {/* 3. JENIS KATEGORI dengan Tanda Tambah (+) dan Opsi Mengetik Kategori Lain */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[11px] font-black">
                  +
                </span>
                <span>JENIS KATEGORI</span>
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
                    setType('token');
                    setAllowCamera(false);
                    setAllowTokenInput(true);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition cursor-pointer shadow-xs"
                title="Klik untuk beralih antara mengetik manual atau memilih opsi standar"
              >
                {isCustomMode ? (
                  <>
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Pilih Opsi Standar</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ Ketik Kategori Lain</span>
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTypeName(val);
                      if (!title || title.includes('DEPOTEL')) {
                        setTitle(val ? `${val} – DEPOTEL` : '');
                      }
                    }}
                    placeholder="Ketik jenis kategori lain (contoh: Token SWFM, BBM Genset, dll)..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-blue-500 bg-blue-50/20 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition placeholder:text-slate-400 placeholder:font-normal"
                    autoFocus
                  />
                  <div className="absolute left-3 top-3 text-blue-600 pointer-events-none">
                    <PenLine className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1 pl-1">
                  <span className="font-bold">+</span>
                  <span>Anda sedang mengetik kategori kustom secara langsung.</span>
                </p>
              </div>
            ) : (
              <div className="relative">
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
                    if (val === 'token') {
                      setAllowCamera(false);
                      setAllowTokenInput(true);
                    } else if (val === 'token_manual') {
                      setAllowCamera(true);
                      setAllowTokenInput(true);
                    } else if (val === 'swacam') {
                      setAllowCamera(true);
                      setAllowTokenInput(false);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition bg-white"
                >
                  <option value="token">+ Token Listrik (Hanya No. Token)</option>
                  <option value="token_manual">+ Token Listrik Manual (No. Token & Kamera Dokumentasi)</option>
                  <option value="swacam">+ Swacam / Catat Meter (Kamera KWh Meter)</option>
                  <option value="custom">+ Ketik / Tambah Kategori Lain...</option>
                </select>
              </div>
            )}
          </div>

          {/* Opsi Tambahan untuk Kategori Kustom */}
          {(isCustomMode || type === 'custom') && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs animate-in fade-in">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                <span>Pengaturan Fitur Kategori:</span>
              </p>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-blue-600 transition">
                <input
                  type="checkbox"
                  checked={allowTokenInput}
                  onChange={(e) => setAllowTokenInput(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>+ Aktifkan Input Nomor Token Listrik</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium hover:text-blue-600 transition">
                <input
                  type="checkbox"
                  checked={allowCamera}
                  onChange={(e) => setAllowCamera(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>+ Aktifkan Kamera Pengambilan Foto KWh Meter</span>
              </label>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Periode Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

