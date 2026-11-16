export function makeRawCve({
  id = 'CVE-2026-0001',
  severity = 'HIGH',
  score = 8.1,
  published = '2026-11-15T10:00:00.000',
  description = 'Buffer overflow in ExampleLib allows remote code execution.',
  references = [
    { url: 'https://example.com/patch', source: 'vendor', tags: ['Patch', 'Vendor Advisory'] },
    { url: 'https://example.com/writeup', source: 'researcher', tags: ['Exploit'] },
  ],
} = {}) {
  return {
    id,
    published,
    lastModified: published,
    vulnStatus: 'Analyzed',
    descriptions: [
      { lang: 'es', value: 'Descripción en español.' },
      { lang: 'en', value: description },
    ],
    metrics: severity
      ? {
          cvssMetricV31: [
            {
              type: 'Primary',
              cvssData: {
                version: '3.1',
                baseScore: score,
                baseSeverity: severity,
                vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
              },
            },
          ],
        }
      : {},
    weaknesses: [{ description: [{ lang: 'en', value: 'CWE-787' }] }],
    references,
  };
}

export function makeNvdResponse(rawCves, totalResults = rawCves.length) {
  return {
    resultsPerPage: rawCves.length,
    startIndex: 0,
    totalResults,
    vulnerabilities: rawCves.map((cve) => ({ cve })),
  };
}

export function mockFetchResponse(body, { ok = true, status = 200 } = {}) {
  return Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
}
