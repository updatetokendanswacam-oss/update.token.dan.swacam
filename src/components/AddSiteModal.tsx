import React, { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, Building2, Hash, Search, Database, Check, Sparkles } from 'lucide-react';
import { SiteItem } from '../types';
import { getMasterSiteDatabase, searchMasterSites, DatabaseSite } from '../utils/siteDatabaseService';

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

  const [masterDatabase, setMasterDatabase] = useState<DatabaseSite[]>([]);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<DatabaseSite[]>([]);

  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  // Load master site database from Google Sheet 1KFQ8WY4NNFAnPuzMYwKnJW9GyvmuPYFfLyk2u8If5AU
  useEffect(() => {
    let isMounted = true;
    getMasterSiteDatabase()
      .then((data) => {
        if (isMounted) {
          setMasterDatabase(data);
          setIsLoadingDatabase(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading master site DB:', err);
        if (isMounted) setIsLoadingDatabase(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update suggestions whenever siteId or siteName changes
  const handleSiteIdChange = (val: string) => {
    setSiteId(val);
    if (masterDatabase.length > 0) {
      const results = searchMasterSites(masterDatabase, val, 20);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSiteNameChange = (val: string) => {
    setSiteName(val);
    if (masterDatabase.length > 0) {
      const results = searchMasterSites(masterDatabase, val, 20);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }
  };

  const handleSelectSite = (item: DatabaseSite) => {
    const formattedId = item.siteId.toUpperCase();
    let formattedName = item.siteName;

    if (item.siteId && item.siteName && !item.siteName.toUpperCase().includes(item.siteId)) {
      formattedName = `${item.siteId}_${item.siteName}`;
    }

    setSiteId(formattedId);
    setSiteName(formattedName);
    if (item.meterId) {
      setMeterId(item.meterId);
    }
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-emerald-600" />
                <p className="text-[11px] font-semibold text-emerald-700">
                  {isLoadingDatabase
                    ? 'Memuat Master DB Site...'
                    : `Terhubung Master DB (${masterDatabase.length.toLocaleString('id-ID')} Site)`}
                </p>
              </div>
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

          {/* Input SITE ID dengan Autocomplete dari Master Database */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Site ID</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 font-sans flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Ketik untuk cari master DB</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={siteId}
                onChange={(e) => handleSiteIdChange(e.target.value)}
                onFocus={() => {
                  if (masterDatabase.length > 0) {
                    const results = searchMasterSites(masterDatabase, siteId, 20);
                    setSuggestions(results);
                    setShowSuggestions(results.length > 0);
                  }
                }}
                placeholder="Ketik Site ID (contoh: BKS598, JKT781, EPE...)"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-sm font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-600 transition placeholder:font-sans placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Suggestions Dropdown Box */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-blue-200 shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
                <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between sticky top-0 border-b border-slate-100">
                  <span>Hasil Master Database ({suggestions.length} site):</span>
                  <span className="text-emerald-700">Google Sheet 2.380+ Site</span>
                </div>

                {suggestions.map((item, idx) => (
                  <div
                    key={`${item.siteId}-${idx}`}
                    onClick={() => handleSelectSite(item)}
                    className="p-2.5 hover:bg-blue-50/80 transition cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                          {item.siteId}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {item.siteName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.subdistrict ? `${item.subdistrict}, ` : ''}
                        {item.village ? item.village : ''}
                        {item.siteOwner ? ` • ${item.siteOwner}` : ''}
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-blue-600 shrink-0 opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Site / Keterangan Lengkap
            </label>
            <textarea
              rows={3}
              value={siteName}
              onChange={(e) => handleSiteNameChange(e.target.value)}
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

