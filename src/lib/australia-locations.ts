import { createRequire } from "module";

type RawLocation = {
  postcode: string;
  locality: string;
  state: string;
};

type LocationRecord = {
  postcode: string;
  locality: string;
  state: string;
};

const require = createRequire(import.meta.url);

let cachedLocations: LocationRecord[] | null = null;
let cachedByPostcode: Map<string, LocationRecord[]> | null = null;
let cachedByLocalityState: Map<string, string> | null = null;

function normalizeText(input: string) {
  return input.trim().toLowerCase();
}

function loadLocations() {
  if (cachedLocations) return cachedLocations;

  const rawData = require("aus-postcode-suburbs/lib/resources/aus_postcodes.json") as unknown;
  if (!Array.isArray(rawData)) {
    cachedLocations = [];
    return cachedLocations;
  }

  cachedLocations = (rawData as RawLocation[])
    .map((item) => ({
      postcode: String(item.postcode ?? "").trim(),
      locality: String(item.locality ?? "").trim(),
      state: String(item.state ?? "").trim().toUpperCase(),
    }))
    .filter((item) => item.postcode && item.locality && item.state);

  return cachedLocations;
}

function getByPostcodeIndex() {
  if (cachedByPostcode) return cachedByPostcode;
  const index = new Map<string, LocationRecord[]>();
  loadLocations().forEach((location) => {
    const list = index.get(location.postcode) ?? [];
    list.push(location);
    index.set(location.postcode, list);
  });
  cachedByPostcode = index;
  return index;
}

function getByLocalityStateIndex() {
  if (cachedByLocalityState) return cachedByLocalityState;
  const index = new Map<string, string>();
  loadLocations().forEach((location) => {
    const key = `${normalizeText(location.locality)}|${location.state}`;
    if (!index.has(key)) {
      index.set(key, location.postcode);
    }
  });
  cachedByLocalityState = index;
  return index;
}

export function getLocationsByPostcode(postcode: string) {
  return getByPostcodeIndex().get(postcode.trim()) ?? [];
}

export function getPrimaryPostcodeForSuburb(suburb: string, state?: string | null) {
  const cleanedSuburb = normalizeText(suburb);
  if (!cleanedSuburb) return null;

  if (state) {
    const stateCode = state.trim().toUpperCase();
    const byState = getByLocalityStateIndex().get(`${cleanedSuburb}|${stateCode}`);
    if (byState) return byState;
  }

  const anyState = loadLocations().find((item) => normalizeText(item.locality) === cleanedSuburb);
  return anyState?.postcode ?? null;
}

export function searchAustralianLocations(
  query: string,
  options?: { state?: string; limit?: number }
): LocationRecord[] {
  const q = query.trim();
  const limit = Math.min(Math.max(options?.limit ?? 12, 1), 50);
  const stateFilter = options?.state?.trim().toUpperCase();

  if (!q) return [];

  if (/^\d{4}$/.test(q)) {
    return getLocationsByPostcode(q)
      .filter((item) => (stateFilter ? item.state === stateFilter : true))
      .slice(0, limit);
  }

  const needle = normalizeText(q);
  const digitQuery = /^\d+$/.test(q);
  const scored: Array<{ score: number; record: LocationRecord }> = [];

  loadLocations().forEach((record) => {
    if (stateFilter && record.state !== stateFilter) return;

    const locality = normalizeText(record.locality);
    let score = Number.POSITIVE_INFINITY;

    if (digitQuery) {
      if (record.postcode.startsWith(q)) score = 0;
    } else {
      if (locality === needle) score = 0;
      else if (locality.startsWith(needle)) score = 1;
      else if (locality.includes(needle)) score = 2;
      else if (record.postcode.startsWith(needle)) score = 3;
    }

    if (Number.isFinite(score)) {
      scored.push({ score, record });
    }
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const byLocality = a.record.locality.localeCompare(b.record.locality);
    if (byLocality !== 0) return byLocality;
    return a.record.postcode.localeCompare(b.record.postcode);
  });

  const deduped: LocationRecord[] = [];
  const seen = new Set<string>();
  for (const item of scored) {
    const key = `${normalizeText(item.record.locality)}|${item.record.state}|${item.record.postcode}`;
    if (seen.has(key)) continue;
    deduped.push(item.record);
    seen.add(key);
    if (deduped.length >= limit) break;
  }

  return deduped;
}
