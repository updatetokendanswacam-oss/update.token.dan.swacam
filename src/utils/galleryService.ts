/**
 * Utility for automatically saving watermarked KWh meter photos
 * directly to the user's mobile device media gallery / download directory.
 */

export async function savePhotoToPhoneGallery(
  dataUrl: string,
  categoryType: string,
  siteId: string
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Lingkungan browser tidak tersedia.' };
  }

  const isToken =
    categoryType.toLowerCase().includes('token') ||
    categoryType.toLowerCase().includes('manual');

  const brandTag = isToken ? 'TOKEN_MANUAL' : 'SWACAM';
  const cleanSiteId = (siteId || 'SITE').replace(/[^a-zA-Z0-9_-]/g, '');
  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `DEPOTEL_${brandTag}_${cleanSiteId}_${timestampStr}.jpg`;

  try {
    // 1. Convert base64 DataURL to binary Blob
    const parts = dataUrl.split(',');
    if (parts.length < 2) {
      throw new Error('DataURL gambar tidak valid.');
    }
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });

    // 2. Programmatically trigger media file download directly to device Pictures/Downloads album
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return {
      success: true,
      message: `Foto ${brandTag} terunduh dan tersimpan ke Galeri HP (${filename})`,
    };
  } catch (err: any) {
    console.warn('Auto save to phone gallery notice:', err);
    return {
      success: false,
      message: err?.message || 'Gagal menyimpan salinan ke Galeri HP.',
    };
  }
}
