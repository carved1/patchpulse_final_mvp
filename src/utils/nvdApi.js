import { normalizeCve } from './cveFormatters';

export const NVD_BASE_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
export const DEFAULT_RESULTS_PER_PAGE = 200;

const DAY_MS = 24 * 60 * 60 * 1000;

export class NvdApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'NvdApiError';
    this.status = status;
  }
}

export function toNvdDate(date) {
  return date.toISOString();
}

export function buildNvdUrl(params = {}) {
  const url = new URL(NVD_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function requestNvd(params, { signal } = {}) {
  let response;
  try {
    response = await fetch(buildNvdUrl(params), { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new NvdApiError('Could not reach the NVD API. Check your connection and try again.');
  }

  if (response.status === 403 || response.status === 429) {
    throw new NvdApiError(
      'The NVD API rate limit was reached (5 requests per 30 seconds). Wait a moment and retry.',
      response.status,
    );
  }
  if (!response.ok) {
    throw new NvdApiError(`The NVD API responded with an error (${response.status}).`, response.status);
  }

  return response.json();
}

/**
 * Fetches CVEs published within the last `days` days, optionally narrowed by keyword.
 * Returns normalized CVEs sorted newest first.
 */
export async function fetchRecentCves({
  days = 3,
  keyword = '',
  resultsPerPage = DEFAULT_RESULTS_PER_PAGE,
  now = new Date(),
  signal,
} = {}) {
  const start = new Date(now.getTime() - days * DAY_MS);
  const params = {
    pubStartDate: toNvdDate(start),
    pubEndDate: toNvdDate(now),
    keywordSearch: keyword.trim(),
    resultsPerPage,
  };
  let data = await requestNvd(params, { signal });

  // NVD returns results oldest-first, so jump to the last page to get the newest CVEs.
  if (data.totalResults > resultsPerPage) {
    data = await requestNvd({ ...params, startIndex: data.totalResults - resultsPerPage }, { signal });
  }

  const cves = (data.vulnerabilities ?? [])
    .map((item) => normalizeCve(item.cve))
    .sort((a, b) => new Date(b.published) - new Date(a.published));

  return { cves, totalResults: data.totalResults ?? cves.length };
}

export async function fetchCveById(cveId, { signal } = {}) {
  const data = await requestNvd({ cveId: cveId.toUpperCase() }, { signal });
  const raw = data.vulnerabilities?.[0]?.cve;
  if (!raw) {
    throw new NvdApiError(`${cveId} was not found in the National Vulnerability Database.`, 404);
  }
  return normalizeCve(raw);
}
