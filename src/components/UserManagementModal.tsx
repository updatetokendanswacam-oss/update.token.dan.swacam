import React, { useState } from 'react';
import { X, UserPlus, Shield, Trash2, Edit2, AlertTriangle, Link as LinkIcon, Copy, Check, Share2, Search } from 'lucide-react';
import { User, UserRole, InviteLink } from '../types';

interface UserManagementModalProps {
  users: User[];
  currentUser: User | null;
  invites: InviteLink[];
  onClose: () => void;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string, permanent: boolean) => void;
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

  // Invite state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setInviteFeedback('Nama anggota wajib diisi');
      return;
    }

    onAddUser({
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      role: newRole,
      status: 'active',
      avatar: '/logo.png',
      isOnline: false,
      lastSeen: 'Baru ditambahkan',
    });

    setNewName('');
    setNewEmail('');
    setNewRole('user');
    setIsAddingUser(false);
    setInviteFeedback('Anggota baru berhasil ditambahkan.');
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
    setInviteFeedback('Data anggota berhasil diperbarui.');
  };

  const handleConfirmDelete = (permanent: boolean) => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser?.id) {
      setInviteFeedback('Anda tidak dapat menghapus akun Anda sendiri.');
      setDeletingUser(null);
      return;
    }

    const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
    if (deletingUser.role === 'admin' && adminCount <= 1) {
      setInviteFeedback('Tidak dapat menghapus administrator terakhir dari sistem.');
      setDeletingUser(null);
      return;
    }

    onDeleteUser(deletingUser.id, permanent);
    setDeletingUser(null);
    setInviteFeedback('Akun anggota telah dihapus.');
  };

  const handleGenerateInvite = (role: UserRole) => {
    onCreateInvite(role);
    setInviteFeedback(`Link undangan berhasil dibuat untuk role: ${role.toUpperCase()}`);
    setTimeout(() => setInviteFeedback(null), 3000);
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
              <h3 className="text-lg font-bold text-[#1e2238]">Kelola Pengguna & Hak Akses</h3>
              <p className="text-xs text-slate-500">Pengaturan Anggota Tim DEPOTEL & Tautan Undangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 pt-4 pb-2">
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
        <div className="my-3 flex-1 overflow-y-auto pr-1">
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
                    onClick={() => setIsAddingUser(true)}
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
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Form Anggota Baru:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nama Lengkap (Wajib)"
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                      required
                    />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Email Google (Opsional)"
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="user">Petugas Lapangan (User)</option>
                      <option value="admin">Administrator (Admin)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold transition cursor-pointer"
                    >
                      Simpan Anggota
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
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition"
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
                          onClick={() => setEditingUser(user)}
                          title={`Edit ${user.name}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingUser(user)}
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
                {inviteFeedback && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2.5">{inviteFeedback}</p>
                )}
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
                <h4 className="font-bold text-[#1e2238] text-base">Edit Pengguna: {editingUser.name}</h4>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUserSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Google</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Role / Peran</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="user">Petugas Lapangan (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Keanggotaan</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1e2238] hover:bg-[#2b304f] text-white text-xs font-bold"
                  >
                    Simpan Perubahan
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
                <p>• <strong>Hapus Permanen:</strong> Menghapus akun dari sistem seluruhnya.</p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Nonaktifkan Saja
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
