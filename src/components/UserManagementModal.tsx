import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  AlertTriangle,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  Search,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole, InviteLink } from '../types';

interface UserManagementModalProps {
  users: User[];
  currentUser: User | null;
  invites: InviteLink[];
  onClose: () => void;
  onAddUser: (user: Partial<User>) => Promise<void>;
  onUpdateUser: (user: User) => Promise<void>;
  onDeleteUser: (userId: string, permanent: boolean) => Promise<void>;
  onCreateInvite: (role: UserRole) => InviteLink;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  users,
  currentUser,
  invites,
  onClose,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onCreateInvite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');

  // Form states for adding user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  // Async submission states & feedback
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Invite state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="w-full max-w-sm rounded-3xl bg-white border border-red-200 shadow-2xl p-6 text-center text-slate-800">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Akses Ditolak</h3>
          <p className="text-xs text-slate-500 mt-2">
            Hanya Administrator yang memiliki izin untuk mengelola anggota tim dan hak akses.
          </p>
          <button
            onClick={onClose}
            className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showSuccessFeedback = (msg: string) => {
    setGeneralSuccess(msg);
    setGeneralError(null);
    setTimeout(() => setGeneralSuccess(null), 4000);
  };

  const showErrorFeedback = (msg: string) => {
    setGeneralError(msg);
    setGeneralSuccess(null);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setGeneralSuccess(null);

    const cleanName = newName.trim();
    if (!cleanName || cleanName.length < 2) {
      showErrorFeedback('Nama anggota minimal harus 2 karakter.');
      return;
    }

    const cleanEmail = newEmail.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showErrorFeedback('Format email Google tidak valid.');
      return;
    }

    // Check if name already registered
    const duplicate = users.find(
      (u) => u.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      showErrorFeedback(`Anggota dengan nama "${cleanName}" sudah terdaftar dalam sistem.`);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await onAddUser({
        name: cleanName,
        email: cleanEmail || undefined,
        role: newRole,
        status: 'active',
        avatar: '/logo.png',
        isOnline: false,
        lastSeen: 'Baru ditambahkan',
      });

      // Clear input only upon confirmed successful save
      setNewName('');
      setNewEmail('');
      setNewRole('user');
      setIsAddingUser(false);
      showSuccessFeedback(`Anggota "${cleanName}" berhasil disimpan permanen ke database!`);
    } catch (err: any) {
      // Keep inputs intact so user can retry without re-typing
      showErrorFeedback(
        err?.message || 'Gagal menyimpan anggota ke database. Periksa koneksi internet lalu coba lagi.'
      );
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setGeneralError(null);
    setGeneralSuccess(null);

    const cleanName = editingUser.name.trim();
    if (!cleanName || cleanName.length < 2) {
      showErrorFeedback('Nama anggota minimal 2 karakter.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await onUpdateUser({
        ...editingUser,
        name: cleanName,
        email: editingUser.email ? editingUser.email.trim() : undefined,
      });
      const savedName = cleanName;
      setEditingUser(null);
      showSuccessFeedback(`Data anggota "${savedName}" berhasil disimpan ke database!`);
    } catch (err: any) {
      showErrorFeedback(err?.message || 'Gagal menyimpan perubahan ke database.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async (permanent: boolean) => {
    if (!deletingUser) return;
    setGeneralError(null);
    setGeneralSuccess(null);

    if (deletingUser.id === currentUser?.id) {
      showErrorFeedback('Anda tidak dapat menghapus akun Anda sendiri.');
      setDeletingUser(null);
      return;
    }

    const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
    if (deletingUser.role === 'admin' && adminCount <= 1) {
      showErrorFeedback('Tidak dapat menghapus administrator terakhir dari sistem.');
      setDeletingUser(null);
      return;
    }

    const targetName = deletingUser.name;
    setIsSubmittingDelete(true);
    try {
      await onDeleteUser(deletingUser.id, permanent);
      setDeletingUser(null);
      showSuccessFeedback(
        permanent
          ? `Akun "${targetName}" berhasil dihapus permanen dari database.`
          : `Akun "${targetName}" berhasil dinonaktifkan di database.`
      );
    } catch (err: any) {
      showErrorFeedback(err?.message || 'Gagal menghapus data dari database.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleGenerateInvite = (role: UserRole) => {
    const inv = onCreateInvite(role);
    showSuccessFeedback(`Link undangan berhasil dibuat untuk role: ${role.toUpperCase()}`);
    return inv;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {
      // fallback
    }
  };

  const getStableInviteUrl = (code: string) => {
    return `${window.location.origin}?invite=${code}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-7 text-slate-800 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#eeeffa] text-[#494c7e]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1e2238]">Kelola Tim & Hak Akses</h3>
              <p className="text-xs text-slate-500">
                Penyimpanan Permanen Anggota Tim DEPOTEL & Pengaturan Akses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {generalSuccess && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{generalSuccess}</span>
          </div>
        )}

        {generalError && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex items-center gap-2 pt-3 pb-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[#1e2238] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Daftar Anggota ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'invites'
                ? 'bg-[#1e2238] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Link Undangan Tim</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="my-2 flex-1 overflow-y-auto pr-1">
          {activeTab === 'members' ? (
            <div className="space-y-4">
              {/* Search bar & Add Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama anggota..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {!isAddingUser && (
                  <button
                    onClick={() => {
                      setIsAddingUser(true);
                      setGeneralError(null);
                      setGeneralSuccess(null);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold shadow transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah Anggota</span>
                  </button>
                )}
              </div>

              {/* Add User Form */}
              {isAddingUser && (
                <form
                  onSubmit={handleAddUserSubmit}
                  className="p-4 rounded-2xl bg-slate-50 border-2 border-blue-200 shadow-xs space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Form Tambah Anggota Tim (Tersimpan ke Database):</span>
                    </span>
                    <button
                      type="button"
                      disabled={isSubmittingAdd}
                      onClick={() => {
                        setIsAddingUser(false);
                        setGeneralError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={newName}
                        disabled={isSubmittingAdd}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          if (generalError) setGeneralError(null);
                        }}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Email Google (Opsional)
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        disabled={isSubmittingAdd}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (generalError) setGeneralError(null);
                        }}
                        placeholder="email@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Role / Hak Akses *
                      </label>
                      <select
                        value={newRole}
                        disabled={isSubmittingAdd}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
                      >
                        <option value="user">Petugas Lapangan (User)</option>
                        <option value="admin">Administrator (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isSubmittingAdd}
                      onClick={() => setIsAddingUser(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdd || !newName.trim()}
                      className="px-5 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow"
                    >
                      {isSubmittingAdd ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Menyimpan ke Database...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simpan Anggota</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  const isActive = user.status === 'active';

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={user.avatar || '/logo.png'}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1e2238] truncate">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                Anda
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                user.role === 'admin'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="truncate">{user.email || 'Tanpa Gmail'}</span>
                            <span>•</span>
                            <span className={isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                              {isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Icons: Edit button right beside Delete button */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setGeneralError(null);
                            setGeneralSuccess(null);
                          }}
                          title={`Edit ${user.name}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingUser(user);
                            setGeneralError(null);
                            setGeneralSuccess(null);
                          }}
                          title={`Hapus / Nonaktifkan ${user.name}`}
                          disabled={isCurrent}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            isCurrent
                              ? 'opacity-30 cursor-not-allowed text-slate-300'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Invites Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#eeeffa] border border-[#e2e4f7]">
                <h4 className="text-sm font-bold text-[#1e2238] flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#494c7e]" />
                  <span>Buat Link Undangan Baru</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Link undangan resmi yang dapat dibuka di WhatsApp, browser HP Android, iPhone, tablet, maupun laptop.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleGenerateInvite('user')}
                    className="px-4 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Buat Link Petugas Lapangan</span>
                  </button>
                  <button
                    onClick={() => handleGenerateInvite('admin')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>+ Buat Link Administrator</span>
                  </button>
                </div>
              </div>

              {/* Invites List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Daftar Tautan Undangan Aktif:
                </h5>
                {invites.length > 0 ? (
                  invites.map((inv) => {
                    const fullUrl = getStableInviteUrl(inv.code);
                    const isCopied = copiedLink === inv.id;
                    return (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              KODE: {inv.code}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-50 text-blue-700">
                              Role: {inv.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Berlaku 30 hari
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={fullUrl}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 select-all bg-slate-50"
                          />
                          <button
                            onClick={() => copyToClipboard(fullUrl, inv.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                          </button>
                          <button
                            onClick={() => {
                              const msg = encodeURIComponent(
                                `Halo rekan tim, silakan bergabung ke Aplikasi Operasional DEPOTEL melalui link resmi:\n${fullUrl}`
                              );
                              window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    Belum ada link undangan dibuat.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit User Dialog */}
        {editingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 text-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-[#1e2238] text-base">Edit Anggota: {editingUser.name}</h4>
                <button
                  disabled={isSubmittingEdit}
                  onClick={() => setEditingUser(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUserSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nama Anggota (Wajib)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmittingEdit}
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold disabled:bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Email Google (Opsional)
                  </label>
                  <input
                    type="email"
                    disabled={isSubmittingEdit}
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Role / Peran
                  </label>
                  <select
                    disabled={isSubmittingEdit}
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-50"
                  >
                    <option value="user">Petugas Lapangan (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    disabled={isSubmittingEdit}
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-50"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSubmittingEdit}
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit || !editingUser.name.trim()}
                    className="px-5 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white border border-red-200 p-6 text-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-[#1e2238] text-base">Konfirmasi Hapus / Nonaktifkan</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus atau menonaktifkan anggota <strong>{deletingUser.name}</strong>?
              </p>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 text-xs text-slate-500 space-y-1 border border-slate-200">
                <p>• <strong>Nonaktifkan:</strong> Menjaga integritas riwayat pekerjaan & upload foto.</p>
                <p>• <strong>Hapus Permanen:</strong> Menghapus akun dari database Firestore seluruhnya.</p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingDelete}
                  onClick={() => setDeletingUser(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDelete}
                  onClick={() => handleConfirmDelete(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingDelete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Nonaktifkan Saja</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDelete}
                  onClick={() => handleConfirmDelete(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingDelete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Hapus Permanen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
