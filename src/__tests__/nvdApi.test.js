import { describe, expect, it, vi } from 'vitest';
import { fetchCveById, fetchRecentCves, NvdApiError } from '../utils/nvdApi';
import { makeNvdResponse, makeRawCve, mockFetchResponse } from '../test/fixtures';

describe('fetchRecentCves', () => {
  it('requests the publish-date window and returns normalized CVEs, newest first', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(
      mockFetchResponse(
        makeNvdResponse(
          [
            makeRawCve({ id: 'CVE-2026-0001', published: '2026-11-14T00:00:00.000' }),
            makeRawCve({ id: 'CVE-2026-0002', published: '2026-11-15T00:00:00.000' }),
          ],
          321,
        ),
      ),
    );

    const now = new Date('2026-11-16T00:00:00.000Z');
    const result = await fetchRecentCves({ days: 3, keyword: ' openssl ', now });

    const url = new URL(fetchSpy.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://services.nvd.nist.gov/rest/json/cves/2.0');
    expect(url.searchParams.get('pubStartDate')).toBe('2026-11-13T00:00:00.000Z');
    expect(url.searchParams.get('pubEndDate')).toBe('2026-11-16T00:00:00.000Z');
    expect(url.searchParams.get('keywordSearch')).toBe('openssl');

    expect(result.totalResults).toBe(321);
    expect(result.cves.map((c) => c.id)).toEqual(['CVE-2026-0002', 'CVE-2026-0001']);
  });

  it('requests the last page when results span multiple pages, so the newest CVEs load', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(mockFetchResponse(makeNvdResponse([makeRawCve({ id: 'CVE-2026-0001' })], 3)))
      .mockReturnValueOnce(mockFetchResponse(makeNvdResponse([makeRawCve({ id: 'CVE-2026-0003' })], 3)));

    const result = await fetchRecentCves({ days: 3, resultsPerPage: 1 });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(new URL(fetchSpy.mock.calls[0][0]).searchParams.has('startIndex')).toBe(false);
    expect(new URL(fetchSpy.mock.calls[1][0]).searchParams.get('startIndex')).toBe('2');
    expect(result.cves.map((c) => c.id)).toEqual(['CVE-2026-0003']);
    expect(result.totalResults).toBe(3);
  });

  it('omits keywordSearch when no keyword is given', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchResponse(makeNvdResponse([])));
    await fetchRecentCves({ days: 1 });
    expect(new URL(fetchSpy.mock.calls[0][0]).searchParams.has('keywordSearch')).toBe(false);
  });

  it('throws a friendly error when the rate limit is hit', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchResponse({}, { ok: false, status: 403 }));
    await expect(fetchRecentCves()).rejects.toThrow(/rate limit/i);
  });

  it('throws when the network request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchRecentCves()).rejects.toBeInstanceOf(NvdApiError);
  });
});

describe('fetchCveById', () => {
  it('fetches a single CVE by id', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(
      mockFetchResponse(makeNvdResponse([makeRawCve({ id: 'CVE-2026-1234' })])),
    );
    const cve = await fetchCveById('cve-2026-1234');
    expect(new URL(fetchSpy.mock.calls[0][0]).searchParams.get('cveId')).toBe('CVE-2026-1234');
    expect(cve.id).toBe('CVE-2026-1234');
  });

  it('throws a not-found error when the NVD has no record', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchResponse(makeNvdResponse([])));
    await expect(fetchCveById('CVE-2026-9999')).rejects.toThrow(/not found/i);
  });
});
