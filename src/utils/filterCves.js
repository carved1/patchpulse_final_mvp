import { SEVERITIES } from './cveFormatters';

const SEVERITY_RANK = Object.fromEntries(SEVERITIES.map((s, index) => [s, SEVERITIES.length - index]));

export const DAY_RANGES = [
  { value: 1, label: 'Last 24 hours' },
  { value: 3, label: 'Last 72 hours' },
  { value: 7, label: 'Last 7 days' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'score', label: 'Highest CVSS score' },
];

export function filterCves(cves, { severities = [], sort = 'newest' } = {}) {
  const filtered = severities.length
    ? cves.filter((cve) => severities.includes(cve.severity))
    : [...cves];

  return filtered.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.published) - new Date(b.published);
    if (sort === 'score') {
      return (b.score ?? -1) - (a.score ?? -1)
        || (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
    }
    return new Date(b.published) - new Date(a.published);
  });
}

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), totalPages, currentPage };
}
