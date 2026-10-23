/**
 * Adds official DEPOTEL operational watermark with Site ID, Site Name, Meter ID, Timestamp & Operator
 */
export async function addDepotelWatermark(
  imageSource: File | Blob | string,
  siteId: string,
  siteName: string,
  meterId: string,
  operatorName: string
): Promise<{ dataUrl: string; formattedTime: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw original photo
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
        const bannerHeight = Math.max(120 * scale, 100);

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
        const subFontSize = Math.max(Math.round(15 * scale), 12);
        const smallFontSize = Math.max(Math.round(13 * scale), 11);

        const paddingLeft = Math.max(20 * scale, 16);
        let currentY = bannerY + (24 * scale);

        // Line 1: Header Brand
        ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('⚡ DEPOTEL GROUP - CATAT METER & TOKEN KWH', paddingLeft, currentY);

        // Line 2: Site ID & Site Name
        currentY += (24 * scale);
        ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#FDE047'; // Bright Yellow for site highlight
        const siteDisplay = `SITE: ${siteId} - ${siteName}`;
        ctx.fillText(siteDisplay, paddingLeft, currentY);

        // Line 3: Meter ID & Operator
        currentY += (20 * scale);
        ctx.font = `500 ${smallFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(`ID Pelanggan/Meter: ${meterId}  |  Petugas: ${operatorName}`, paddingLeft, currentY);

        // Line 4: Timestamp (Date & Time)
        currentY += (18 * scale);
        ctx.font = `600 ${smallFontSize}px monospace`;
        ctx.fillStyle = '#67E8F9'; // Cyan for clear time
        ctx.fillText(`🕒 Waktu Pengambilan: ${fullTimeString}`, paddingLeft, currentY);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl, formattedTime: fullTimeString });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for watermarking'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageSource);
    }
  });
}
