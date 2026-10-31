import React, { useState } from 'react';
import { X, PlusCircle, Building2, Hash } from 'lucide-react';
import { SiteItem } from '../types';

interface AddSiteModalProps {
  onClose: () => void;
  onAddSite: (newSite: Omit<SiteItem, 'id'>) => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  onClose,
  onAddSite,
}) => {
  const [meterId, setMeterId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() && !siteId.trim()) {
      setErrorMessage('Nama Site atau Site ID wajib diisi');
      return;
    }

    const cleanSiteName = siteName.trim() || siteId.trim().toUpperCase();
    const extractedCode = cleanSiteName.match(/^([A-Z0-9_-]{3,12})/i)?.[1]?.toUpperCase();
    const cleanSiteId = siteId.trim().toUpperCase() || extractedCode || 'SITE';

    onAddSite({
      meterId: meterId.trim(),
      siteId: cleanSiteId,
      siteName: cleanSiteName,
      checked: false,
      tokens: [],
      photos: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Tambah Site Baru</h3>
              <p className="text-xs text-slate-500">Tambahkan site ke daftar monitoring saat ini</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>No. ID Pelanggan / Meter</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 font-sans uppercase">
                (Opsional - Boleh Kosong)
              </span>
            </label>
            <input
              type="text"
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
              placeholder="Contoh: 547402150841 atau biarkan kosong"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Site ID</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 font-sans uppercase">
                (Opsional)
              </span>
            </label>
            <input
              type="text"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Contoh: JKT781"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-600 transition placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Site / Keterangan Lengkap
            </label>
            <textarea
              rows={3}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Contoh: JKT781-TanahKoja1TBG-MACRO atau JKT727_JLRayaTiparCakungDMT-MACRO (Juned)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambahkan Site</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
