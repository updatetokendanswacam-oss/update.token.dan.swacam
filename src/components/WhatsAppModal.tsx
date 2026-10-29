import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare } from 'lucide-react';
import { UpdateCategory } from '../types';

interface WhatsAppModalProps {
  category: UpdateCategory;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  category,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const totalSites = category.sites.length;
  const checkedSites = category.sites.filter((s) => s.checked).length;
  const uncheckedSites = totalSites - checkedSites;
  const percentage =
    totalSites > 0
      ? ((checkedSites / totalSites) * 100).toFixed(2).replace('.', ',')
      : '0,00';

  const buildWhatsAppText = () => {
    const isNeteco = category.type === 'neteco_unmon' || category.title.toLowerCase().includes('neteco');

    const titleLine = category.title ? category.title.trim() : 'Update List – DEPOTEL';
    const periodLine = category.period ? category.period.trim() : 'Bulan Oktober 2026';

    let header = '';
    if (isNeteco) {
      // Calculate integer percentage if whole number, e.g. 71%
      const percentageInt = totalSites > 0 ? Math.round((checkedSites / totalSites) * 100) : 0;
      header = `${titleLine}\n${periodLine}\nJumlah Site NETECO : ${totalSites}\nSubmitted NETECO : ${percentageInt}%\n==============================`;
    } else {
      header = `${titleLine}\n${periodLine}\nJumlah Tiket Site : ${totalSites} Site\n✅ Sudah Tercentang : ${checkedSites} Site\n❌ Belum Tercentang : ${uncheckedSites} Site\n📊 Submitted : ${percentage}%\n=================================`;
    }

    const listLines = category.sites.map((site) => {
      const icon = site.checked ? '✅' : '❌';
      const meterStr = site.meterId && site.meterId.trim() !== '' && site.meterId.trim() !== '-' ? site.meterId.trim() : '';
      const cleanSiteId = site.siteId ? site.siteId.trim().toUpperCase() : '';
      const cleanSiteName = site.siteName ? site.siteName.trim() : '';

      let nameDisplay = '-';
      if (cleanSiteId && cleanSiteName) {
        if (cleanSiteName.toUpperCase().includes(cleanSiteId)) {
          nameDisplay = cleanSiteName;
        } else {
          nameDisplay = `${cleanSiteId}_${cleanSiteName}`;
        }
      } else if (cleanSiteName) {
        nameDisplay = cleanSiteName;
      } else if (cleanSiteId) {
        nameDisplay = cleanSiteId;
      }

      let line = '';
      if (meterStr) {
        line = `${icon} ${meterStr} | ${nameDisplay}`;
      } else {
        line = `${icon}${nameDisplay}`;
      }

      if (site.tokens && site.tokens.length > 0) {
        const tokensFormatted = site.tokens
          .map((t) => t.trim().replace(/^#\s*/, ''))
          .filter((t) => t.length > 0)
          .join('\n');
        if (tokensFormatted) {
          line += `\n${tokensFormatted}`;
        }
      }
      return line;
    });

    return `${header}\n${listLines.join('\n')}`;
  };

  const whatsappText = buildWhatsAppText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Update List ke WhatsApp</h3>
              <p className="text-xs text-slate-500">Format resmi pesan update DEPOTEL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Preview */}
        <div className="my-4 flex-1 overflow-y-auto">
          <pre className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
            {whatsappText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Total {totalSites} Site • {checkedSites} Selesai • {uncheckedSites} Belum
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Buka WhatsApp & Kirim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
