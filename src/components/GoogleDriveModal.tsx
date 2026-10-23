import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Folder,
  FileText,
  Upload,
  Download,
  ShieldCheck,
  LogOut,
  HardDrive,
  FolderArchive,
  ArrowRight,
  Database,
  Check,
  FileCode
} from 'lucide-react';
import {
  TARGET_DRIVE_ID,
  signInWithGoogle,
  signOutGoogle,
  fetchDriveResource,
  fetchDriveFileContent,
  uploadToDrive,
  listFilesInFolder,
  DriveResource
} from '../utils/googleDrive';
import { User as FirebaseUser } from 'firebase/auth';
import { UpdateCategory, SiteItem, User } from '../types';

interface GoogleDriveModalProps {
  currentUser: User | null;
  categories: UpdateCategory[];
  onClose: () => void;
  onImportSitesFromDrive?: (importedSites: SiteItem[], categoryTitle: string) => void;
  onShowToast: (message: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  currentUser,
  categories,
  onClose,
  onImportSitesFromDrive,
  onShowToast,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab: 'transfer' | 'explorer' | 'import'
  const [activeTab, setActiveTab] = useState<'transfer' | 'explorer' | 'import'>('transfer');

  // Resource details state for TARGET_DRIVE_ID
  const [driveResource, setDriveResource] = useState<DriveResource | null>(null);
  const [explorerFiles, setExplorerFiles] = useState<DriveResource[]>([]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  // Transfer all data state
  const [isTransferringAll, setIsTransferringAll] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  // Sync / Import state
  const [isSyncingData, setIsSyncingData] = useState(false);

  // Total summary of all data
  const totalSitesCount = React.useMemo(
    () => categories.reduce((acc, cat) => acc + cat.sites.length, 0),
    [categories]
  );
  const checkedSitesCount = React.useMemo(
    () => categories.reduce((acc, cat) => acc + cat.sites.filter((s) => s.checked).length, 0),
    [categories]
  );
  const totalTokensCount = React.useMemo(
    () => categories.reduce((acc, cat) => acc + cat.sites.reduce((tAcc, s) => tAcc + (s.tokens?.length || 0), 0), 0),
    [categories]
  );

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        onShowToast(`Terhubung dengan akun Google: ${res.user.email}`);
        loadDriveTarget(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir browser.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setAccessToken(null);
      setDriveResource(null);
      setExplorerFiles([]);
      onShowToast('Koneksi Google Drive terputus');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Load target drive resource metadata & files
  const loadDriveTarget = useCallback(async (token?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;

    setIsLoadingResource(true);
    setResourceError(null);
    try {
      // 1. Fetch metadata for TARGET_DRIVE_ID
      const resource = await fetchDriveResource(TARGET_DRIVE_ID, activeToken);
      setDriveResource(resource);

      // 2. Fetch list of files in folder TARGET_DRIVE_ID
      const files = await listFilesInFolder(TARGET_DRIVE_ID, activeToken);
      setExplorerFiles(files);
    } catch (err: any) {
      console.error('Fetch target resource error:', err);
      setResourceError(err.message || 'Tidak dapat memuat berkas atau folder Google Drive.');
    } finally {
      setIsLoadingResource(false);
    }
  }, [accessToken]);

  // Execute transfer of ALL data to TARGET_DRIVE_ID
  const handleExecuteTransferAll = async () => {
    if (!accessToken) {
      onShowToast('Silakan masuk dengan Google terlebih dahulu');
      return;
    }

    setIsTransferringAll(true);
    setTransferSuccess(null);

    try {
      const nowStr = new Date().toISOString().slice(0, 10);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // 1. Generate full JSON database backup
      const fullBackupPayload = {
        metadata: {
          system: 'DEPOTEL GROUP MONITORING SYSTEM',
          destinationId: TARGET_DRIVE_ID,
          transferredAt: new Date().toISOString(),
          transferredBy: currentUser?.name || 'Petugas',
          userRole: currentUser?.role || 'user',
          totalCategories: categories.length,
          totalSites: totalSitesCount,
          totalCheckedSites: checkedSitesCount,
          totalTokens: totalTokensCount,
        },
        categories,
      };

      const jsonFileName = `DEPOTEL_SEMUA_DATA_${nowStr}_${timestamp}.json`;
      const jsonContent = JSON.stringify(fullBackupPayload, null, 2);

      // 2. Generate full comprehensive CSV Table for all categories & sites
      const csvHeaders = [
        'No',
        'Kategori',
        'Periode',
        'Site ID',
        'Nama Site',
        'ID Pelanggan / Meter',
        'Status Ceklis',
        'Nomor Token',
        'Jumlah Foto',
        'Terakhir Diperbarui',
        'Petugas Lapangan',
      ];

      let rowNumber = 1;
      const csvRows: string[] = [];

      categories.forEach((cat) => {
        cat.sites.forEach((site) => {
          const statusText = site.checked ? 'SUDAH' : 'BELUM';
          const tokensText = (site.tokens || []).join('; ');
          const photosCount = (site.photos || []).length;
          const updatedDate = site.updatedAt ? new Date(site.updatedAt).toLocaleString('id-ID') : '-';
          const updatedPerson = site.updatedBy || '-';

          csvRows.push(
            [
              rowNumber++,
              `"${cat.title.replace(/"/g, '""')}"`,
              `"${cat.period.replace(/"/g, '""')}"`,
              `"${site.siteId}"`,
              `"${site.siteName.replace(/"/g, '""')}"`,
              `"${site.meterId}"`,
              `"${statusText}"`,
              `"${tokensText.replace(/"/g, '""')}"`,
              photosCount,
              `"${updatedDate}"`,
              `"${updatedPerson.replace(/"/g, '""')}"`,
            ].join(',')
          );
        });
      });

      const csvFileName = `DEPOTEL_REKAP_SEMUA_SITE_${nowStr}_${timestamp}.csv`;
      const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows].join('\n');

      // Upload JSON to target ID
      await uploadToDrive(
        jsonFileName,
        jsonContent,
        'application/json',
        TARGET_DRIVE_ID,
        accessToken
      );

      // Upload CSV spreadsheet to target ID
      await uploadToDrive(
        csvFileName,
        csvContent,
        'text/csv',
        TARGET_DRIVE_ID,
        accessToken
      );

      setShowConfirmTransfer(false);
      setTransferSuccess(
        `Semua data (${categories.length} kategori, ${totalSitesCount} site) berhasil dipindahkan ke ID: ${TARGET_DRIVE_ID}`
      );
      onShowToast(`Semua data berhasil dipindahkan ke Google Drive target`);

      // Refresh file explorer list
      await loadDriveTarget(accessToken);
    } catch (err: any) {
      console.error('Transfer all data error:', err);
      onShowToast(`Gagal memindahkan data: ${err.message}`);
    } finally {
      setIsTransferringAll(false);
    }
  };

  // Sync / Import data from TARGET_DRIVE_ID file into local dashboard
  const handleSyncFromDrive = async () => {
    if (!accessToken) return;
    setIsSyncingData(true);
    try {
      const content = await fetchDriveFileContent(
        TARGET_DRIVE_ID,
        driveResource?.mimeType,
        accessToken
      );

      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const parsedSites: SiteItem[] = [];

      const startIndex =
        lines[0]?.toLowerCase().includes('site') || lines[0]?.toLowerCase().includes('meter') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const row = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (row.length >= 2) {
          const siteId = row[0] || `SIT${100 + i}`;
          const siteName = row[1] || `Site ${siteId}`;
          const meterId = row[2] || (538700000000 + i * 111).toString();
          const tokenVal = row[3] || '';

          parsedSites.push({
            id: `site-drive-${Date.now()}-${i}`,
            siteId,
            siteName,
            meterId,
            checked: row[4]?.toLowerCase() === 'sudah' || row[4]?.toLowerCase() === 'true',
            tokens: tokenVal ? [tokenVal] : [],
            photos: [],
            updatedAt: new Date().toISOString(),
            updatedBy: 'Google Drive Sync',
          });
        }
      }

      if (parsedSites.length > 0 && onImportSitesFromDrive) {
        onImportSitesFromDrive(parsedSites, driveResource?.name || 'Impor Google Drive');
        onShowToast(`Berhasil menyinkronkan ${parsedSites.length} site dari Google Drive`);
      } else {
        onShowToast('Berkas terbaca, format CSV standar: SiteID, SiteName, MeterID, Token');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      onShowToast(`Gagal sinkronisasi: ${err.message}`);
    } finally {
      setIsSyncingData(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#171a2e] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1e2238] dark:text-white flex items-center gap-2">
                <span>File Explorer & Google Drive</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">
                Target ID: {TARGET_DRIVE_ID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target ID Card Banner */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-200 uppercase tracking-wider text-[10px]">
              Tujuan File Explorer / Drive ID
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Aktif
            </span>
          </div>
          <p className="font-mono text-xs sm:text-sm text-yellow-300 break-all select-all font-bold tracking-wide">
            {TARGET_DRIVE_ID}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={`https://drive.google.com/open?id=${TARGET_DRIVE_ID}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1 transition underline underline-offset-2"
            >
              <span>Buka di Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://docs.google.com/spreadsheets/d/${TARGET_DRIVE_ID}/edit`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1 transition underline underline-offset-2"
            >
              <span>Buka Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        {googleUser && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl mt-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'transfer'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pindah Semua Data</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('explorer');
                loadDriveTarget();
              }}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'explorer'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>File Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'import'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Impor Data</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="my-3 flex-1 overflow-y-auto space-y-3">
          {/* Authentication State */}
          {!googleUser ? (
            <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1e2238] dark:text-white">
                  Hubungkan Google Drive untuk Memindahkan Data
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Aplikasi membutuhkan izin untuk memindahkan dan menyinkronkan seluruh berkas monitoring
                  ke ID <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{TARGET_DRIVE_ID}</span>.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Connected Google Account Header */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-emerald-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      {googleUser.email?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200 leading-tight">
                      {googleUser.displayName || 'Pengguna Google'}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono truncate max-w-[200px]">
                      {googleUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignOut}
                  title="Putuskan Akun"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/80 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Success Notification */}
              {transferSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pemindahan Berhasil!</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{transferSuccess}</p>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: PINDAHKAN SEMUA DATA KE TARGET ID */}
              {/* ======================================================== */}
              {activeTab === 'transfer' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Ringkasan Data yang Akan Dipindahkan
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kategori</p>
                        <p className="text-sm sm:text-base font-extrabold text-[#1e2238] dark:text-white mt-0.5">
                          {categories.length}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Site</p>
                        <p className="text-sm sm:text-base font-extrabold text-[#1e2238] dark:text-white mt-0.5">
                          {totalSitesCount}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Token Ceklis</p>
                        <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {checkedSitesCount}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <p className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Format JSON Lengkap: Semua kategori, status ceklis, ID meter, token, foto GPS.</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Format Spreadsheet (.CSV): Tabel lengkap seluruh site yang siap dibuka di Excel/Sheets.</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Dipindahkan langsung ke ID target: <strong className="font-mono text-blue-600 dark:text-blue-400">{TARGET_DRIVE_ID}</strong>.</span>
                      </p>
                    </div>
                  </div>

                  {/* Big Primary Action Button: Pindahkan Semua Data */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmTransfer(true)}
                    disabled={isTransferringAll}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className={`w-4 h-4 ${isTransferringAll ? 'animate-bounce' : ''}`} />
                    <span>
                      {isTransferringAll
                        ? 'Sedang Memindahkan Semua Data...'
                        : 'Pindahkan Semua Data ke ID 10SRjggSklTu...'}
                    </span>
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: FILE EXPLORER (JELAJAH BERKAS DI TARGET ID) */}
              {/* ======================================================== */}
              {activeTab === 'explorer' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-blue-500" />
                        <span>File Explorer ({explorerFiles.length} Berkas)</span>
                      </h4>
                      <button
                        onClick={() => loadDriveTarget()}
                        disabled={isLoadingResource}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        title="Segarkan berkas"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingResource ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {isLoadingResource ? (
                      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Memuat berkas dari Google Drive...</span>
                      </div>
                    ) : resourceError ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                        <p className="font-semibold">Info Berkas/Folder:</p>
                        <p className="mt-0.5">{resourceError}</p>
                      </div>
                    ) : explorerFiles.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                        {explorerFiles.map((f) => (
                          <div
                            key={f.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {f.mimeType?.includes('spreadsheet') || f.name.endsWith('.csv') ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : f.mimeType?.includes('json') || f.name.endsWith('.json') ? (
                                <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                              ) : f.mimeType?.includes('folder') ? (
                                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {f.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('id-ID') : '-'}
                                </p>
                              </div>
                            </div>
                            {f.webViewLink && (
                              <a
                                href={f.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-400 hover:text-blue-600 shrink-0 ml-2"
                                title="Buka Berkas"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                        <Folder className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                        <p>Belum ada berkas cadangan di dalam target ID ini.</p>
                        <button
                          onClick={() => setActiveTab('transfer')}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          Pindahkan Semua Data Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: IMPOR DARI GOOGLE DRIVE */}
              {/* ======================================================== */}
              {activeTab === 'import' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Sinkronkan / Impor Data dari Berkas Target
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Membaca data spreadsheet atau berkas CSV dari ID <strong className="font-mono text-blue-600">{TARGET_DRIVE_ID}</strong> dan mengimpornya ke dalam daftar site monitoring.
                    </p>

                    <button
                      type="button"
                      onClick={handleSyncFromDrive}
                      disabled={isSyncingData}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      <Download className={`w-4 h-4 ${isSyncingData ? 'animate-bounce' : ''}`} />
                      <span>{isSyncingData ? 'Menyinkronkan...' : 'Impor Site dari Google Drive'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[200px] font-mono text-[11px]">
            ID: {TARGET_DRIVE_ID.slice(0, 14)}...
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Confirmation Modal for Moving All Data to TARGET_DRIVE_ID */}
        {showConfirmTransfer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#171a2e] border border-slate-200 dark:border-slate-800 p-5 text-center space-y-3 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Pindahkan Semua Data ke ID Target?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Seluruh data monitoring ({categories.length} kategori, {totalSitesCount} site, status checklist,
                token listrik, dan rekap spreadsheet) akan diunggah ke Google Drive dengan ID:{' '}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 break-all">
                  {TARGET_DRIVE_ID}
                </span>.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmTransfer(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteTransferAll}
                  disabled={isTransferringAll}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  {isTransferringAll ? 'Memindahkan...' : 'Ya, Pindahkan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
