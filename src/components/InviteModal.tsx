import React, { useState } from 'react';
import { X, UserPlus, Link as LinkIcon, Copy, Check, Share2, Shield } from 'lucide-react';
import { UserRole, InviteLink } from '../types';

interface InviteModalProps {
  onClose: () => void;
  onCreateInvite: (role: UserRole) => InviteLink;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  onClose,
  onCreateInvite,
}) => {
  const [role, setRole] = useState<UserRole>('user');
  const [createdInvite, setCreatedInvite] = useState<InviteLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    const inv = onCreateInvite(role);
    setCreatedInvite(inv);
  };

  const getInviteUrl = () => {
    if (!createdInvite) return '';
    return `${window.location.origin}?invite=${createdInvite.code}`;
  };

  const handleCopy = async () => {
    const url = getInviteUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareWA = () => {
    const url = getInviteUrl();
    const msg = encodeURIComponent(
      `Halo rekan tim! Silakan akses Aplikasi Operasional DEPOTEL (Update Token & Swacam) melalui link resmi berikut:\n${url}\n\nSetelah membuka link, Anda langsung dapat mengisi token dan swacam catat meter.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e2238]">Bagikan Link Akses Tim</h3>
              <p className="text-xs text-slate-500">Undang rekan tim untuk mengisi di HP manapun</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Pilih Peran Anggota:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  role === 'user'
                    ? 'bg-blue-50 border-blue-500 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>Petugas Lapangan</span>
                <span className="text-[10px] font-normal text-slate-400">Dapat mengisi Token & Swacam</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-50 border-amber-500 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>Administrator</span>
                <span className="text-[10px] font-normal text-slate-400">Kelola pengguna & hapus foto</span>
              </button>
            </div>
          </div>

          {!createdInvite ? (
            <button
              onClick={handleCreate}
              className="w-full py-3 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white font-bold text-sm shadow transition cursor-pointer"
            >
              Buat Link Undangan Resmi
            </button>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Link Undangan Siap Digunakan!</span>
              </p>
              <input
                type="text"
                readOnly
                value={getInviteUrl()}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 select-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
                <button
                  onClick={handleShareWA}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">💡 Akses Langsung:</p>
            <p>Rekan kerja dapat membuka link melalui WhatsApp pada HP Android atau iPhone manapun dan langsung masuk ke dashboard monitoring update Token & Swacam.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
