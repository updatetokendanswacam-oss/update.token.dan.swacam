import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { SiteItem, User, PhotoRecord } from '../types';
import { addDepotelWatermark } from '../utils/watermark';

interface CameraModalProps {
  site: SiteItem;
  currentUser: User | null;
  onClose: () => void;
  onSavePhoto: (siteId: string, photo: PhotoRecord) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  site,
  currentUser,
  onClose,
  onSavePhoto,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewWatermarked, setPreviewWatermarked] = useState<{ dataUrl: string; formattedTime: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          currentUser?.name || 'Petugas'
        );
        setPreviewWatermarked(watermarked);
        stopCamera();
      }
    } catch (err) {
      console.error('Error capturing live frame:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const watermarked = await addDepotelWatermark(
        file,
        site.siteId,
        site.siteName,
        site.meterId,
        currentUser?.name || 'Petugas'
      );
      setPreviewWatermarked(watermarked);
    } catch (err) {
      console.error('Error processing uploaded file:', err);
      setCameraError('Gagal memproses gambar. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!previewWatermarked) return;

    const newPhoto: PhotoRecord = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      siteId: site.id,
      siteName: site.siteName,
      meterId: site.meterId,
      dataUrl: previewWatermarked.dataUrl,
      timestamp: new Date().toISOString(),
      capturedBy: currentUser?.name || 'Petugas',
      formattedTime: previewWatermarked.formattedTime,
    };

    onSavePhoto(site.id, newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span>Dokumentasi Foto KWh Meter</span>
            </h3>
            <p className="text-xs text-yellow-300 font-mono mt-0.5 truncate max-w-xs">
              {site.siteId} - {site.siteName}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="my-4 flex-1 overflow-y-auto">
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Menempelkan Watermark DEPOTEL Resmi...</p>
              <p className="text-xs text-slate-400">Site ID, Meter ID, Tanggal & Jam WIB</p>
            </div>
          ) : previewWatermarked ? (
            /* Preview with Watermark */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/40 bg-black">
                <img
                  src={previewWatermarked.dataUrl}
                  alt="Preview Watermark"
                  className="w-full max-h-[50vh] object-contain mx-auto"
                />
              </div>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200">
                <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Foto berhasil distempel dengan data resmi:</span>
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
                <button
                  onClick={startCamera}
                  className="p-5 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border-2 border-dashed border-blue-500/50 hover:border-blue-400 flex flex-col items-center justify-center gap-3 text-center transition group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-blue-600 text-white group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Buka Kamera Langsung</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ambil foto langsung dari kamera HP/laptop</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center gap-3 text-center transition group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Pilih Dari Galeri / File</p>
                    <p className="text-xs text-slate-400 mt-0.5">Unggah foto KWh meter yang sudah ada</p>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">ℹ️ Ketentuan Dokumentasi Foto:</p>
                <p>• Foto akan otomatis distempel dengan Site ID, Nama Site, Meter ID, serta Waktu Lengkap (Tanggal & Jam WIB).</p>
                <p>• Foto tersimpan aman tanpa masa kedaluwarsa dan dapat diunduh kapanpun.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {previewWatermarked && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={() => setPreviewWatermarked(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer"
            >
              Foto Ulang
            </button>
            <button
              onClick={handleConfirmSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Foto Permanen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
