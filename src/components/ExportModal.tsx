import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Copy, Check } from 'lucide-react';
import { UpdateCategory } from '../types';

interface ExportModalProps {
  category: UpdateCategory;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  category,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const generateCSV = () => {
    const headers = ['No', 'ID Pelanggan / Meter', 'Site ID', 'Nama Site', 'Status', 'Nomor Token', 'Jumlah Foto'];
    const rows = category.sites.map((site, index) => {
      const statusText = site.checked ? 'SUDAH' : 'BELUM';
      const tokensText = (site.tokens || []).join('; ');
      const photosCount = (site.photos || []).length;
      return [
        index + 1,
        `"${site.meterId}"`,
        `"${site.siteId}"`,
        `"${site.siteName.replace(/"/g, '""')}"`,
        `"${statusText}"`,
        `"${tokensText}"`,
        photosCount,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = '\uFEFF' + generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEPOTEL_${category.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(generateCSV());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Ekspor Data Site</h3>
              <p className="text-xs text-slate-500">Unduh data dalam format Spreadsheet / Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
            <p>
              Kategori: <strong>{category.title}</strong>
            </p>
            <p>
              Periode: <strong>{category.period}</strong>
            </p>
            <p>
              Total Site: <strong>{category.sites.length} Site</strong> ({category.sites.filter(s => s.checked).length} Sudah, {category.sites.filter(s => !s.checked).length} Belum)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadCSV}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Excel (.CSV)</span>
            </button>

            <button
              onClick={handleCopyData}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Data Tabel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
