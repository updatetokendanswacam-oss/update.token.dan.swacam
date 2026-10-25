import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, Loader2, CloudUpload } from 'lucide-react';
import { SiteItem, User, PhotoRecord, UpdateCategory } from '../types';
import { addDepotelWatermark, getPhotoWatermarkBrand } from '../utils/watermark';

interface CameraModalProps {
  site: SiteItem;
  category?: UpdateCategory | null;
  categoryTitle?: string;
  currentUser: User | null;
  onClose: () => void;
  onSavePhoto: (siteId: string, photo: PhotoRecord) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  site,
  category,
  categoryTitle,
  currentUser,
  onClose,
  onSavePhoto,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewWatermarked, setPreviewWatermarked] = useState<{ dataUrl: string; formattedTime: string; brandTitle: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Uploading / saving state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const directCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const brandTitle = useMemo(() => {
    return getPhotoWatermarkBrand(category?.title || categoryTitle || category?.type);
  }, [category, categoryTitle]);

  // Stop camera when closing
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      setUseLiveCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error, fallback to file upload:', err);
      setCameraError('Kamera tidak dapat diakses langsung. Silakan gunakan tombol "Pilih / Ambil dari Galeri HP".');
      setUseLiveCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseLiveCamera(false);
  };

  const captureLiveFrame = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setUploadError(null);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const watermarked = await addDepotelWatermark(
          dataUrl,
          site.siteId,
          site.siteName,
          site.meterId,
          currentUser?.name || 'Petugas',
          brandTitle
        );
        setPreviewWatermarked(watermarked);
        stopCamera();
      }
    } catch (err) {
      console.error('Error capturing live frame:', err);
      setCameraError('Gagal mengambil frame foto kamera.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);
    try {
      const watermarked = await addDepotelWatermark(
        file,
        site.siteId,
        site.siteName,
        site.meterId,
        currentUser?.name || 'Petugas',
        brandTitle
      );
      setPreviewWatermarked(watermarked);
    } catch (err) {
      console.error('Error processing uploaded file:', err);
      setCameraError('Gagal memproses gambar. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!previewWatermarked || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    const newPhoto: PhotoRecord = {
      id: `photo-${site.siteId || 'site'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      siteId: site.id,
      siteName: site.siteName,
      meterId: site.meterId,
      dataUrl: previewWatermarked.dataUrl,
      timestamp: new Date().toISOString(),
      capturedBy: currentUser?.name || 'Petugas',
      capturedById: currentUser?.id || 'usr-anonymous',
      categoryType: category?.type || 'swacam',
      categoryTitle: category?.title || categoryTitle || '',
      brandTitle: previewWatermarked.brandTitle || brandTitle,
      formattedTime: previewWatermarked.formattedTime,
    };

    try {
      await onSavePhoto(site.id, newPhoto);
      setUploadSuccess(true);
      setTimeout(() => {
        onClose();
      }, 250);
    } catch (err: any) {
      console.error('Photo save error:', err);
      setUploadError(
        err?.message || 'Gagal mengunggah foto ke penyimpanan permanen. Periksa koneksi internet lalu coba lagi.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                {brandTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span>Dokumentasi Foto KWh Meter</span>
            </h3>
            <p className="text-xs text-yellow-300 font-mono mt-0.5 truncate max-w-xs">
              {site.siteId} - {site.siteName}
            </p>
          </div>
          <button
            disabled={isUploading}
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="my-4 flex-1 overflow-y-auto">
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Menempelkan Watermark {brandTitle}...</p>
              <p className="text-xs text-slate-400">Site ID, Meter ID, Tanggal & Jam WIB</p>
            </div>
          ) : previewWatermarked ? (
            /* Preview with Watermark */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/40 bg-black">
                <img
                  src={previewWatermarked.dataUrl}
                  alt={`Preview Watermark ${brandTitle}`}
                  className="w-full max-h-[50vh] object-contain mx-auto"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-700 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Foto berhasil tersimpan secara permanen di database cloud!</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200">
                <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Foto berhasil distempel ({brandTitle}):</span>
                </p>
                <p className="mt-1 text-slate-300">
                  Waktu: <strong>{previewWatermarked.formattedTime}</strong>
                </p>
                <p className="text-slate-300">
                  Petugas: <strong>{currentUser?.name || 'Petugas'}</strong>
                </p>
              </div>
            </div>
          ) : useLiveCamera ? (
            /* Live Camera Stream */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={captureLiveFrame}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Ambil Jepretan</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            /* Options to Choose: Open Camera or Upload */
            <div className="space-y-4 py-4">
              {cameraError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi 1: Buka Kamera Khusus Ambil Foto Langsung */}
                <button
                  type="button"
                  onClick={() => {
                    if (directCameraInputRef.current) {
                      directCameraInputRef.current.click();
                    } else {
                      startCamera();
                    }
                  }}
                  className="p-5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border-2 border-dashed border-blue-500/70 hover:border-blue-400 flex flex-col items-center justify-center gap-3 text-center transition group cursor-pointer"
                >
                  <div className="p-3.5 rounded-full bg-blue-600 text-white group-hover:scale-110 shadow-lg shadow-blue-900/50 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
                      <span>Buka Kamera</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-semibold uppercase">Langsung</span>
                    </p>
                    <p className="text-xs text-slate-300 mt-1">Akses langsung ke kamera HP untuk jepret foto KWh</p>
                  </div>
                </button>

                {/* Opsi 2: Pilih Dari Galeri / File */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border-2 border-dashed border-emerald-500/60 hover:border-emerald-400 flex flex-col items-center justify-center gap-3 text-center transition group cursor-pointer"
                >
                  <div className="p-3.5 rounded-full bg-emerald-600 text-white group-hover:scale-110 shadow-lg shadow-emerald-900/50 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
                      <span>Pilih Dari Galeri / File</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-semibold uppercase">Galeri</span>
                    </p>
                    <p className="text-xs text-slate-300 mt-1">Buka galeri / album foto jika sudah ada foto sebelumnya</p>
                  </div>
                </button>
              </div>

              {/* Input khusus Kamera Langsung (capture="environment") */}
              <input
                ref={directCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Input khusus Galeri HP / File */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer"
                >
                  Atau gunakan live viewfinder kamera web
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Ketentuan Dokumentasi Foto:</p>
                <p>• Foto akan otomatis distempel dengan Site ID, Nama Site, Meter ID, serta Waktu Lengkap (Tanggal & Jam WIB).</p>
                <p>• Foto diunggah dan disimpan permanen di database cloud tanpa batasan masa kedaluwarsa.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {previewWatermarked && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              disabled={isUploading}
              onClick={() => {
                setPreviewWatermarked(null);
                setUploadError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer disabled:opacity-50"
            >
              Foto Ulang
            </button>
            <button
              disabled={isUploading || uploadSuccess}
              onClick={handleConfirmSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4 text-emerald-200" />
                  <span>Simpan Foto Permanen</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
