export const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const PATCH_TAGS = ['Patch', 'Vendor Advisory', 'Release Notes', 'Mitigation'];

function pickMetric(metrics = {}) {
  const sources = [
    metrics.cvssMetricV31,
    metrics.cvssMetricV40,
    metrics.cvssMetricV30,
    metrics.cvssMetricV2,
  ];
  for (const list of sources) {
    if (list?.length) {
      return list.find((metric) => metric.type === 'Primary') ?? list[0];
    }
  }
  return null;
}

function getEnglishDescription(descriptions = []) {
  return (descriptions.find((d) => d.lang === 'en') ?? descriptions[0])?.value ?? '';
}

function getWeaknesses(weaknesses = []) {
  const ids = weaknesses.flatMap((w) => w.description?.map((d) => d.value) ?? []);
  return [...new Set(ids)].filter((id) => id.startsWith('CWE-'));
}

export function normalizeCve(raw) {
  const metric = pickMetric(raw.metrics);
  const cvssData = metric?.cvssData ?? {};
  const severity = (cvssData.baseSeverity ?? metric?.baseSeverity ?? 'UNKNOWN').toUpperCase();
  const references = (raw.references ?? []).map((ref) => ({
    url: ref.url,
    source: ref.source ?? '',
    tags: ref.tags ?? [],
  }));

  return {
    id: raw.id,
    description: getEnglishDescription(raw.descriptions),
    published: raw.published,
    lastModified: raw.lastModified,
    status: raw.vulnStatus ?? 'Unknown',
    severity,
    score: cvssData.baseScore ?? null,
    vector: cvssData.vectorString ?? '',
    cvssVersion: cvssData.version ?? '',
    weaknesses: getWeaknesses(raw.weaknesses),
    references,
  };
}

export function getPatchReferences(references = []) {
  return references.filter((ref) => ref.tags.some((tag) => PATCH_TAGS.includes(tag)));
}

export function getOtherReferences(references = []) {
  return references.filter((ref) => !ref.tags.some((tag) => PATCH_TAGS.includes(tag)));
}

export function countBySeverity(cves = []) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
  cves.forEach((cve) => {
    const key = cve.severity in counts ? cve.severity : 'UNKNOWN';
    counts[key] += 1;
  });
  return counts;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function truncate(text = '', maxLength = 180) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
