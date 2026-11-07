export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address: string;
}

/**
 * Reverse geocodes latitude and longitude into a detailed Indonesian address string.
 * Tries OpenStreetMap Nominatim first, then BigDataCloud as a fallback.
 * Includes a timeout so camera capturing remains fast and responsive.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    // Attempt OpenStreetMap Nominatim with Indonesian locale
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=id`;
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DailyReportingDepotelApp/1.0'
      },
      signal: controller.signal
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const parts: string[] = [];

        // Road / Street
        const road = addr.road || addr.pedestrian || addr.path || addr.suburb;
        if (road) parts.push(road);

        // Building / House number
        if (addr.house_number) parts.push(`No. ${addr.house_number}`);

        // Kelurahan / Village / Neighbourhood
        const village = addr.village || addr.kelurahan || addr.hamlet || addr.neighbourhood;
        if (village) parts.push(`Kel. ${village}`);

        // Kecamatan / Subdistrict
        const district = addr.subdistrict || addr.kecamatan || addr.city_district;
        if (district) parts.push(`Kec. ${district}`);

        // City / Regency
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.regency;
        if (city) parts.push(city);

        // State / Province
        if (addr.state) parts.push(addr.state);

        // Postcode
        if (addr.postcode) parts.push(addr.postcode);

        if (parts.length > 0) {
          clearTimeout(timeoutId);
          return parts.join(', ');
        } else if (data.display_name) {
          clearTimeout(timeoutId);
          return data.display_name;
        }
      }
    }
  } catch (e) {
    // Nominatim failed or timed out, attempt fallback
  }

  // Fallback API: BigDataCloud free client API
  try {
    const bdcController = new AbortController();
    const bdcTimeout = setTimeout(() => bdcController.abort(), 2500);

    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
    const response = await fetch(bdcUrl, { signal: bdcController.signal });
    clearTimeout(bdcTimeout);

    if (response.ok) {
      const data = await response.json();
      const parts: string[] = [];
      if (data.locality) parts.push(data.locality);
      if (data.city) parts.push(data.city);
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (data.countryName) parts.push(data.countryName);

      if (parts.length > 0) {
        clearTimeout(timeoutId);
        return parts.join(', ');
      }
    }
  } catch (e) {
    // Fallback failed
  }

  clearTimeout(timeoutId);
  return 'Alamat tidak dapat dimuat (Koordinat tersimpan)';
}

/**
 * Gets real-time browser GPS position with standard high accuracy option and timeout.
 */
export function getCurrentDevicePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser Anda'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
      }
    );
  });
}
