import { describe, expect, it } from 'vitest';
import {
  countBySeverity,
  getOtherReferences,
  getPatchReferences,
  normalizeCve,
  truncate,
} from '../utils/cveFormatters';
import { filterCves, paginate } from '../utils/filterCves';
import { validateLogin } from '../utils/validation';
import { makeRawCve } from '../test/fixtures';

describe('normalizeCve', () => {
  it('extracts the fields the UI needs from a raw NVD record', () => {
    const cve = normalizeCve(makeRawCve());
    expect(cve).toMatchObject({
      id: 'CVE-2026-0001',
      description: 'Buffer overflow in ExampleLib allows remote code execution.',
      severity: 'HIGH',
      score: 8.1,
      cvssVersion: '3.1',
      status: 'Analyzed',
      weaknesses: ['CWE-787'],
    });
    expect(cve.references).toHaveLength(2);
  });

  it('marks CVEs without CVSS metrics as UNKNOWN', () => {
    const cve = normalizeCve(makeRawCve({ severity: null }));
    expect(cve.severity).toBe('UNKNOWN');
    expect(cve.score).toBeNull();
  });
});

describe('reference helpers', () => {
  it('separates patch guidance from other references', () => {
    const { references } = normalizeCve(makeRawCve());
    expect(getPatchReferences(references).map((r) => r.url)).toEqual(['https://example.com/patch']);
    expect(getOtherReferences(references).map((r) => r.url)).toEqual(['https://example.com/writeup']);
  });
});

describe('countBySeverity', () => {
  it('tallies each severity level', () => {
    const cves = ['CRITICAL', 'HIGH', 'HIGH', 'UNKNOWN'].map((severity) => ({ severity }));
    expect(countBySeverity(cves)).toEqual({ CRITICAL: 1, HIGH: 2, MEDIUM: 0, LOW: 0, UNKNOWN: 1 });
  });
});

describe('filterCves', () => {
  const cves = [
    { id: 'A', severity: 'LOW', score: 2, published: '2026-11-10' },
    { id: 'B', severity: 'CRITICAL', score: 9.8, published: '2026-11-12' },
    { id: 'C', severity: 'HIGH', score: 7.5, published: '2026-11-14' },
  ];

  it('filters by severity without mutating the input', () => {
    const copy = [...cves];
    const result = filterCves(cves, { severities: ['HIGH', 'CRITICAL'] });
    expect(result.map((c) => c.id)).toEqual(['C', 'B']);
    expect(cves).toEqual(copy);
  });

  it('sorts by score and by date', () => {
    expect(filterCves(cves, { sort: 'score' }).map((c) => c.id)).toEqual(['B', 'C', 'A']);
    expect(filterCves(cves, { sort: 'oldest' }).map((c) => c.id)).toEqual(['A', 'B', 'C']);
  });
});

describe('paginate', () => {
  it('slices a page and clamps out-of-range page numbers', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    expect(paginate(items, 3, 10)).toEqual({ pageItems: [20, 21, 22, 23, 24], totalPages: 3, currentPage: 3 });
    expect(paginate(items, 99, 10).currentPage).toBe(3);
  });
});

describe('truncate', () => {
  it('shortens long text with an ellipsis', () => {
    expect(truncate('abcdef', 3)).toBe('abc…');
    expect(truncate('abc', 3)).toBe('abc');
  });
});

describe('validateLogin', () => {
  it('requires a valid email and a password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
    expect(validateLogin({ email: 'nope', password: 'x' })).toEqual({ email: 'Enter a valid email address.' });
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
  });
});
