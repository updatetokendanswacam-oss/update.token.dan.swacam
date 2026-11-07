/**
 * Helper to fetch device Geolocation coordinates for watermarking.
 * Returns formatted Alamat Site & GPS coordinates (or registered site address if GPS unavailable).
 */
export async function getDeviceGeolocationString(siteId: string, siteName: string): Promise<string> {
  const cleanId = siteId ? siteId.trim() : '-';
  const cleanName = siteName ? siteName.trim() : '-';
  const siteAddressLabel = `${cleanName} (${cleanId})`;

  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return siteAddressLabel;
  }

  try {
    const pos = await new Promise<GeolocationPosition | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2500);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          clearTimeout(timeout);
          resolve(p);
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 2500, maximumAge: 10000 }
      );
    });

    if (pos && pos.coords) {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      const acc = pos.coords.accuracy ? ` (±${Math.round(pos.coords.accuracy)}m)` : '';
      return `${siteAddressLabel} | GPS: ${lat}, ${lng}${acc}`;
    }
  } catch (err) {
    console.warn('Geolocation lookup notice:', err);
  }

  return siteAddressLabel;
}

/**
 * Resolves the official operational brand watermark title based on the active list / category:
 * - List "Pengisian Token Listrik Manual – DEPOTEL" -> "DEPOTEL GROUP - TOKEN MANUAL"
 * - List "Update Swacam/Catat Meter – DEPOTEL" -> "DEPOTEL GROUP - SWACAM"
 */
export function getPhotoWatermarkBrand(categoryTitleOrType?: string): string {
  if (!categoryTitleOrType) return 'DEPOTEL GROUP - SWACAM';
  const lower = categoryTitleOrType.toLowerCase().trim();

  // Specifically check for NETECO / UNMON
  if (
    lower.includes('neteco') ||
    lower.includes('unmon') ||
    lower === 'neteco_unmon'
  ) {
    return 'DEPOTEL GROUP - NETECO UNMON';
  }

  // Specifically check for Token SWFM list
  if (lower.includes('swfm')) {
    return 'DEPOTEL GROUP - TOKEN SWFM';
  }

  // Specifically check for Token Manual list
  if (
    lower.includes('token manual') ||
    lower.includes('token listrik manual') ||
    lower.includes('pengisian token') ||
    lower === 'token_manual'
  ) {
    return 'DEPOTEL GROUP - TOKEN MANUAL';
  }

  // Specifically check for Swacam / Catat Meter list
  if (
    lower.includes('swacam') ||
    lower.includes('catat meter') ||
    lower === 'swacam'
  ) {
    return 'DEPOTEL GROUP - SWACAM';
  }

  // Fallback for any other token list
  if (lower.includes('token')) {
    return 'DEPOTEL GROUP - TOKEN MANUAL';
  }

  // If already prefixed with DEPOTEL GROUP
  if (categoryTitleOrType.toUpperCase().startsWith('DEPOTEL GROUP - ')) {
    return categoryTitleOrType.toUpperCase();
  }

  return `DEPOTEL GROUP - ${categoryTitleOrType.toUpperCase()}`;
}

/**
 * Adds official DEPOTEL operational watermark with Site ID, Site Name, Meter ID, Geotag Location, Timestamp & Operator.
 * The brand header dynamically reflects the active list:
 * - "DEPOTEL GROUP - TOKEN MANUAL" for Pengisian Token Listrik Manual – DEPOTEL
 * - "DEPOTEL GROUP - SWACAM" for Update Swacam/Catat Meter – DEPOTEL
 */
export async function addDepotelWatermark(
  imageSource: File | Blob | string,
  siteId: string,
  siteName: string,
  meterId: string,
  operatorName: string,
  categoryTitleOrType?: string,
  customGeotag?: string
): Promise<{ dataUrl: string; formattedTime: string; brandTitle: string; geotag: string }> {
  const brandTitle = getPhotoWatermarkBrand(categoryTitleOrType);
  const geotagText = customGeotag || (await getDeviceGeolocationString(siteId, siteName));

  return new Promise((resolve, reject) => {
    let objectUrlToRevoke: string | null = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }

        const originalWidth = img.naturalWidth || img.width || 1280;
        const originalHeight = img.naturalHeight || img.height || 720;
        const maxDimension = 1280;

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > maxDimension || originalHeight > maxDimension) {
          if (originalWidth >= originalHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round((originalHeight / originalWidth) * maxDimension);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((originalWidth / originalHeight) * maxDimension);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw original photo resized cleanly
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Date and Time formatting in Indonesian (WIB)
        const now = new Date();
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const day = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedDate = `${day} ${month} ${year}`;
        const formattedTimeOnly = `${hours}:${minutes}:${seconds} WIB`;
        const fullTimeString = `${formattedDate}, ${formattedTimeOnly}`;

        // Scale factors relative to canvas width
        const baseWidth = Math.max(canvas.width, 800);
        const scale = baseWidth / 1000;
        const bannerHeight = Math.max(136 * scale, 115);

        // Gradient dark overlay banner at bottom
        const bannerY = canvas.height - bannerHeight;
        const gradient = ctx.createLinearGradient(0, bannerY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(11, 43, 103, 0.88)');
        gradient.addColorStop(1, 'rgba(5, 18, 44, 0.96)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

        // Red Accent stripe
        ctx.fillStyle = '#E11D48';
        ctx.fillRect(0, bannerY, canvas.width, Math.max(4 * scale, 3));

        // Watermark Text styling
        const titleFontSize = Math.max(Math.round(20 * scale), 16);
        const subFontSize = Math.max(Math.round(14 * scale), 12);
        const smallFontSize = Math.max(Math.round(12.5 * scale), 10.5);

        const paddingLeft = Math.max(20 * scale, 16);
        let currentY = bannerY + (22 * scale);

        // Line 1: Header Brand (Dynamic based on active list)
        ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(brandTitle, paddingLeft, currentY);

        // Line 2: Site ID & Site Name
        currentY += (22 * scale);
        ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#FDE047';
        const siteDisplay = `SITE: ${siteId} - ${siteName}`;
        ctx.fillText(siteDisplay, paddingLeft, currentY);

        // Line 3: Meter ID & Operator
        currentY += (19 * scale);
        ctx.font = `500 ${smallFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(`ID Pelanggan/Meter: ${meterId || '-'}  |  Petugas: ${operatorName}`, paddingLeft, currentY);

        // Line 4: Geotag Coordinates & Location
        currentY += (18 * scale);
        ctx.font = `600 ${smallFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#A7F3D0';
        ctx.fillText(`📍 Geotag: ${geotagText}`, paddingLeft, currentY);

        // Line 5: Timestamp (Date & Time)
        currentY += (18 * scale);
        ctx.font = `600 ${smallFontSize}px monospace`;
        ctx.fillStyle = '#67E8F9';
        ctx.fillText(`🕒 Waktu: ${fullTimeString}`, paddingLeft, currentY);

        // Quality 0.76 provides ultra-crisp output at ~90KB size for 3x faster network delivery
        const dataUrl = canvas.toDataURL('image/jpeg', 0.76);
        resolve({ dataUrl, formattedTime: fullTimeString, brandTitle, geotag: geotagText });
      } catch (err) {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        reject(err);
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(new Error('Failed to load image for watermarking'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    }
  });
}
