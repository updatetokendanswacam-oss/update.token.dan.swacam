import { reverseGeocode } from './geocodingService';

export interface GeotagDetails {
  address: string;
  latitude: string;
  longitude: string;
  accuracy?: string;
  formattedDate: string;
  formattedTime: string;
  operatorName: string;
  siteName: string;
  siteId: string;
  rawText?: string;
}

/**
 * Retrieves device GPS coordinates and reverse geocodes them into full address details.
 */
export async function getDeviceGeolocationDetails(
  siteId: string,
  siteName: string,
  registeredAddress?: string
): Promise<GeotagDetails> {
  const cleanId = siteId ? siteId.trim() : '-';
  const cleanName = siteName ? siteName.trim() : '-';
  const defaultSiteDisplay = `${cleanName} (${cleanId})`;

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
  const formattedTime = `${hours}:${minutes}:${seconds} WIB`;

  let latStr = '-';
  let lngStr = '-';
  let accStr = '';
  let fullAddress = registeredAddress || `Site ${defaultSiteDisplay}`;

  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 3500);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            clearTimeout(timeout);
            resolve(p);
          },
          () => {
            clearTimeout(timeout);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 3500, maximumAge: 5000 }
        );
      });

      if (pos && pos.coords) {
        latStr = pos.coords.latitude.toFixed(6);
        lngStr = pos.coords.longitude.toFixed(6);
        if (pos.coords.accuracy) {
          accStr = ` (±${Math.round(pos.coords.accuracy)}m)`;
        }
        // Perform reverse geocoding
        const geoAddr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geoAddr && !geoAddr.includes('tidak dapat dimuat')) {
          fullAddress = geoAddr;
        } else if (registeredAddress) {
          fullAddress = `${registeredAddress} (GPS: ${latStr}, ${lngStr})`;
        } else {
          fullAddress = `Site ${defaultSiteDisplay} (GPS: ${latStr}, ${lngStr})`;
        }
      }
    } catch (err) {
      console.warn('Geolocation lookup notice:', err);
    }
  }

  return {
    address: fullAddress,
    latitude: latStr !== '-' ? `${latStr}${accStr}` : '-',
    longitude: lngStr,
    formattedDate,
    formattedTime,
    operatorName: '-',
    siteName: cleanName,
    siteId: cleanId,
    rawText: `Alamat: ${fullAddress} | Lat: ${latStr} | Lng: ${lngStr}`
  };
}

/**
 * Helper to fetch device Geolocation coordinates string for backward compatibility.
 */
export async function getDeviceGeolocationString(siteId: string, siteName: string): Promise<string> {
  const details = await getDeviceGeolocationDetails(siteId, siteName);
  return `${details.address} (Lat: ${details.latitude}, Lng: ${details.longitude})`;
}

/**
 * Resolves the official operational brand watermark title based on the active list / category.
 */
export function getPhotoWatermarkBrand(categoryTitleOrType?: string): string {
  if (!categoryTitleOrType) return 'DEPOTEL GROUP - SWACAM';
  const lower = categoryTitleOrType.toLowerCase().trim();

  if (lower.includes('neteco') || lower.includes('unmon') || lower === 'neteco_unmon') {
    return 'DEPOTEL GROUP - NETECO UNMON';
  }
  if (lower.includes('swfm')) {
    return 'DEPOTEL GROUP - TOKEN SWFM';
  }
  if (
    lower.includes('token manual') ||
    lower.includes('token listrik manual') ||
    lower.includes('pengisian token') ||
    lower === 'token_manual'
  ) {
    return 'DEPOTEL GROUP - TOKEN MANUAL';
  }
  if (lower.includes('swacam') || lower.includes('catat meter') || lower === 'swacam') {
    return 'DEPOTEL GROUP - SWACAM';
  }
  if (lower.includes('token')) {
    return 'DEPOTEL GROUP - TOKEN MANUAL';
  }
  if (categoryTitleOrType.toUpperCase().startsWith('DEPOTEL GROUP - ')) {
    return categoryTitleOrType.toUpperCase();
  }
  return `DEPOTEL GROUP - ${categoryTitleOrType.toUpperCase()}`;
}

/**
 * Adds official DEPOTEL operational watermark with strict GEOTAG LOCATION formatting:
 * GEOTAG LOCATION
 * Alamat: [Alamat lengkap hasil GPS]
 * Latitude: [Koordinat Latitude]
 * Longitude: [Koordinat Longitude]
 * Tanggal: [Tanggal WIB]
 * Waktu: [Waktu WIB]
 * Petugas: [Nama user]
 * Site: [Nama site]
 */
export async function addDepotelWatermark(
  imageSource: File | Blob | string,
  siteId: string,
  siteName: string,
  meterId: string,
  operatorName: string,
  categoryTitleOrType?: string,
  customGeotag?: string,
  geotagDetailsParam?: GeotagDetails
): Promise<{ dataUrl: string; formattedTime: string; brandTitle: string; geotag: string }> {
  const brandTitle = getPhotoWatermarkBrand(categoryTitleOrType);
  const geoDetails = geotagDetailsParam || (await getDeviceGeolocationDetails(siteId, siteName));
  geoDetails.operatorName = operatorName || geoDetails.operatorName;

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

        const dateStr = geoDetails.formattedDate || `${day} ${month} ${year}`;
        const timeStr = geoDetails.formattedTime || `${hours}:${minutes}:${seconds} WIB`;
        const fullTimeString = `${dateStr}, ${timeStr}`;

        // Scale factors relative to canvas width
        const baseWidth = Math.max(canvas.width, 800);
        const scale = baseWidth / 1000;
        
        // Multi-line address wrapping logic
        const subFontSize = Math.max(Math.round(13.5 * scale), 11.5);
        const fontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.font = `600 ${subFontSize}px ${fontStack}`;

        const maxTextWidth = canvas.width - (40 * scale);
        const addressPrefix = 'Alamat: ';
        const rawAddressText = customGeotag || geoDetails.address;
        
        // Wrap address if it exceeds max width
        const addressWords = rawAddressText.split(' ');
        const addressLines: string[] = [];
        let currentLine = addressPrefix;

        for (let i = 0; i < addressWords.length; i++) {
          const testLine = currentLine + (currentLine === addressPrefix ? '' : ' ') + addressWords[i];
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxTextWidth && i > 0) {
            addressLines.push(currentLine);
            currentLine = '   ' + addressWords[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          addressLines.push(currentLine);
        }

        // Calculate total banner height dynamically based on number of address lines
        const lineStep = 18 * scale;
        const totalAddressHeight = addressLines.length * lineStep;
        const fixedContentHeight = (135 * scale); // Header, Lat/Lng, Date/Time, Petugas, Site, Brand
        const bannerHeight = Math.max(fixedContentHeight + totalAddressHeight, 185);

        // Gradient dark overlay banner at bottom
        const bannerY = canvas.height - bannerHeight;
        const gradient = ctx.createLinearGradient(0, bannerY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(11, 25, 60, 0.92)');
        gradient.addColorStop(1, 'rgba(4, 12, 32, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

        // Red Accent stripe
        ctx.fillStyle = '#E11D48';
        ctx.fillRect(0, bannerY, canvas.width, Math.max(4 * scale, 3));

        // Watermark Text styling
        const titleFontSize = Math.max(Math.round(18 * scale), 15);
        const headerGeoFontSize = Math.max(Math.round(15 * scale), 13);
        const valueFontSize = Math.max(Math.round(13 * scale), 11);

        const paddingLeft = Math.max(20 * scale, 16);
        let currentY = bannerY + (22 * scale);

        // Line 1: GEOTAG LOCATION + Brand Badge
        ctx.font = `bold ${headerGeoFontSize}px ${fontStack}`;
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('📍 GEOTAG LOCATION', paddingLeft, currentY);

        ctx.font = `bold ${titleFontSize}px ${fontStack}`;
        ctx.fillStyle = '#FDE047';
        const brandTextWidth = ctx.measureText(brandTitle).width;
        ctx.fillText(brandTitle, canvas.width - paddingLeft - brandTextWidth, currentY);

        // Line 2+: Alamat
        ctx.font = `600 ${subFontSize}px ${fontStack}`;
        ctx.fillStyle = '#FFFFFF';
        for (const line of addressLines) {
          currentY += lineStep;
          ctx.fillText(line, paddingLeft, currentY);
        }

        // Line 3: Latitude & Longitude
        currentY += (20 * scale);
        ctx.font = `600 ${valueFontSize}px ${fontStack}`;
        ctx.fillStyle = '#A7F3D0';
        const latLngStr = `Latitude: ${geoDetails.latitude}   |   Longitude: ${geoDetails.longitude}`;
        ctx.fillText(latLngStr, paddingLeft, currentY);

        // Line 4: Tanggal & Waktu (WIB)
        currentY += (18 * scale);
        ctx.font = `600 ${valueFontSize}px ${fontStack}`;
        ctx.fillStyle = '#67E8F9';
        const dateTimeStr = `Tanggal: ${dateStr}   |   Waktu: ${timeStr}`;
        ctx.fillText(dateTimeStr, paddingLeft, currentY);

        // Line 5: Petugas & Site
        currentY += (18 * scale);
        ctx.font = `600 ${valueFontSize}px ${fontStack}`;
        ctx.fillStyle = '#F472B6';
        const displaySite = siteName ? `${siteName} (${siteId || '-'})` : (siteId || '-');
        const petugasSiteStr = `Petugas: ${operatorName || '-'}   |   Site: ${displaySite}`;
        ctx.fillText(petugasSiteStr, paddingLeft, currentY);

        const summaryGeotag = `Alamat: ${rawAddressText} | Lat: ${geoDetails.latitude} | Lng: ${geoDetails.longitude} | Petugas: ${operatorName} | Site: ${displaySite}`;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        resolve({ dataUrl, formattedTime: fullTimeString, brandTitle, geotag: summaryGeotag });
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
