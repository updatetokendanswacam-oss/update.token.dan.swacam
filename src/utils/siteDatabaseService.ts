/**
 * Service to fetch, cache, and search the official master site database
 * from Google Sheets ID: 1KFQ8WY4NNFAnPuzMYwKnJW9GyvmuPYFfLyk2u8If5AU
 */

export interface DatabaseSite {
  siteId: string;
  siteName: string;
  siteOwner?: string;
  city?: string;
  subdistrict?: string;
  village?: string;
  cluster?: string;
}

const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1KFQ8WY4NNFAnPuzMYwKnJW9GyvmuPYFfLyk2u8If5AU/export?format=csv';

const LOCAL_STORAGE_CACHE_KEY = 'depotel_master_site_database_v1';

let inMemorySiteDatabase: DatabaseSite[] | null = null;
let fetchPromise: Promise<DatabaseSite[]> | null = null;

/**
 * Robust CSV line parser supporting quoted fields and embedded commas
 */
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Loads master site database from LocalStorage cache or fetches from Google Sheet
 */
export async function getMasterSiteDatabase(): Promise<DatabaseSite[]> {
  if (inMemorySiteDatabase && inMemorySiteDatabase.length > 0) {
    return inMemorySiteDatabase;
  }

  // Check LocalStorage cache for instant offline load
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as DatabaseSite[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemorySiteDatabase = parsed;
          // Trigger background refresh in case Google Sheet updated
          refreshSiteDatabaseInBackground();
          return inMemorySiteDatabase;
        }
      }
    } catch {
      // Ignored
    }
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(GOOGLE_SHEETS_CSV_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const lines = csvText.split('\n');

      const sites: DatabaseSite[] = [];
      const seenKeys = new Set<string>();

      // Skip header (line 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        const rawName = cols[0]?.replace(/^"+|"+$/g, '').trim() || '';
        const rawId = cols[1]?.replace(/^"+|"+$/g, '').trim().toUpperCase() || '';

        if (!rawName && !rawId) continue;

        const siteId = rawId || rawName.toUpperCase();
        const siteName = rawName || rawId;

        const uniqueKey = `${siteId}___${siteName}`;
        if (seenKeys.has(uniqueKey)) continue;
        seenKeys.add(uniqueKey);

        sites.push({
          siteId,
          siteName,
          siteOwner: cols[2]?.replace(/^"+|"+$/g, '').trim(),
          city: cols[4]?.replace(/^"+|"+$/g, '').trim(),
          cluster: cols[8]?.replace(/^"+|"+$/g, '').trim(),
          subdistrict: cols[9]?.replace(/^"+|"+$/g, '').trim(),
          village: cols[10]?.replace(/^"+|"+$/g, '').trim(),
        });
      }

      if (sites.length > 0) {
        inMemorySiteDatabase = sites;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(sites));
          } catch {
            // Ignored if storage full
          }
        }
      }

      return sites;
    } catch (err) {
      console.warn('Failed fetching master site database from Google Sheet:', err);
      return inMemorySiteDatabase || [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Background refresh without blocking initial load
 */
async function refreshSiteDatabaseInBackground(): Promise<void> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) return;
    const csvText = await response.text();
    const lines = csvText.split('\n');

    const sites: DatabaseSite[] = [];
    const seenKeys = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const cols = parseCSVLine(line);
      const rawName = cols[0]?.replace(/^"+|"+$/g, '').trim() || '';
      const rawId = cols[1]?.replace(/^"+|"+$/g, '').trim().toUpperCase() || '';

      if (!rawName && !rawId) continue;

      const siteId = rawId || rawName.toUpperCase();
      const siteName = rawName || rawId;

      const uniqueKey = `${siteId}___${siteName}`;
      if (seenKeys.has(uniqueKey)) continue;
      seenKeys.add(uniqueKey);

      sites.push({
        siteId,
        siteName,
        siteOwner: cols[2]?.replace(/^"+|"+$/g, '').trim(),
        city: cols[4]?.replace(/^"+|"+$/g, '').trim(),
        cluster: cols[8]?.replace(/^"+|"+$/g, '').trim(),
        subdistrict: cols[9]?.replace(/^"+|"+$/g, '').trim(),
        village: cols[10]?.replace(/^"+|"+$/g, '').trim(),
      });
    }

    if (sites.length > 0) {
      inMemorySiteDatabase = sites;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(sites));
        } catch {
          // Ignored
        }
      }
    }
  } catch {
    // Silent background fail
  }
}

/**
 * Fast search helper for Site ID & Site Name autocomplete
 */
export function searchMasterSites(database: DatabaseSite[], query: string, limit = 25): DatabaseSite[] {
  if (!query || !query.trim()) {
    return database.slice(0, 10);
  }

  const q = query.trim().toLowerCase();

  const exactId: DatabaseSite[] = [];
  const prefixId: DatabaseSite[] = [];
  const containsIdOrName: DatabaseSite[] = [];

  for (const site of database) {
    const sId = site.siteId.toLowerCase();
    const sName = site.siteName.toLowerCase();
    const sub = (site.subdistrict || '').toLowerCase();
    const vil = (site.village || '').toLowerCase();

    if (sId === q || sName === q) {
      exactId.push(site);
    } else if (sId.startsWith(q) || sName.startsWith(q)) {
      prefixId.push(site);
    } else if (sId.includes(q) || sName.includes(q) || sub.includes(q) || vil.includes(q)) {
      containsIdOrName.push(site);
    }

    if (exactId.length + prefixId.length + containsIdOrName.length >= limit * 2) {
      break;
    }
  }

  return [...exactId, ...prefixId, ...containsIdOrName].slice(0, limit);
}
