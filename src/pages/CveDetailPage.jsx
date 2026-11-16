import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCveData } from '../hooks/useCveData';
import { useWatchlist } from '../hooks/useWatchlist';
import { formatDate, getOtherReferences, getPatchReferences } from '../utils/cveFormatters';
import Card from '../components/Card';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RemediationControls from '../components/RemediationControls';
import SeverityBadge from '../components/SeverityBadge';
import WatchlistButton from '../components/WatchlistButton';

const CVE_ID_PATTERN = /^CVE-\d{4}-\d{4,}$/i;

function ReferenceList({ references }) {
  return (
    <ul className="reference-list">
      {references.map((ref) => (
        <li key={ref.url}>
          <a href={ref.url} target="_blank" rel="noreferrer">{ref.url}</a>
          {ref.tags.length > 0 && (
            <span className="reference-list__tags">
              {ref.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CveDetailPage() {
  const { cveId } = useParams();
  const { getCve, loadCve } = useCveData();
  const { getItem, update } = useWatchlist();
  const { isAdmin } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [failure, setFailure] = useState({ key: null, message: null });

  const isValidId = CVE_ID_PATTERN.test(cveId);
  const cve = getCve(cveId);
  const hasCve = Boolean(cve);
  const requestKey = `${cveId}#${attempt}`;
  const error = failure.key === requestKey ? failure.message : null;

  // Only hits the network on a direct visit or refresh; list pages already populated the cache.
  useEffect(() => {
    if (!isValidId || hasCve) return undefined;
    let ignore = false;
    loadCve(cveId).catch((err) => {
      if (!ignore) setFailure({ key: requestKey, message: err.message });
    });
    return () => {
      ignore = true;
    };
  }, [cveId, isValidId, hasCve, loadCve, requestKey]);

  if (!isValidId) {
    return (
      <div className="page">
        <ErrorMessage title="Invalid CVE ID" message={`"${cveId}" is not a valid CVE identifier (e.g. CVE-2026-12345).`} />
        <Link to="/cves">← Back to Browse</Link>
      </div>
    );
  }

  if (error && !cve) {
    return (
      <div className="page">
        <ErrorMessage title="Could not load this CVE" message={error} onRetry={() => setAttempt((n) => n + 1)} />
        <Link to="/cves">← Back to Browse</Link>
      </div>
    );
  }

  if (!cve) {
    return <LoadingSpinner label={`Loading ${cveId.toUpperCase()}…`} />;
  }

  const patchRefs = getPatchReferences(cve.references);
  const otherRefs = getOtherReferences(cve.references);
  const watchItem = getItem(cve.id);

  return (
    <div className="page">
      <Link to="/cves" className="back-link">← Back to Browse</Link>

      <div className="detail-header">
        <div>
          <h1 className="detail-header__title">{cve.id}</h1>
          <p className="muted">
            Published {formatDate(cve.published)} · Updated {formatDate(cve.lastModified)} · {cve.status}
          </p>
        </div>
        <div className="detail-header__actions">
          <SeverityBadge severity={cve.severity} score={cve.score} />
          <WatchlistButton cve={cve} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-grid__main">
          <Card title="Description">
            <p>{cve.description || 'No description provided.'}</p>
          </Card>

          <Card title="How to Patch">
            {patchRefs.length ? (
              <>
                <p className="muted">Official fixes and vendor advisories referenced by the NVD:</p>
                <ReferenceList references={patchRefs} />
              </>
            ) : (
              <p className="muted">
                No patch or vendor advisory is linked yet. Check the references below and monitor
                this CVE from your watchlist.
              </p>
            )}
          </Card>

          {otherRefs.length > 0 && (
            <Card title={`Other references (${otherRefs.length})`}>
              <ReferenceList references={otherRefs} />
            </Card>
          )}
        </div>

        <div className="detail-grid__side">
          <Card title="Technical details">
            <dl className="detail-list">
              <dt>CVSS score</dt>
              <dd>{cve.score ?? 'Not yet scored'}{cve.cvssVersion && ` (v${cve.cvssVersion})`}</dd>
              <dt>Vector</dt>
              <dd><code className="wrap">{cve.vector || '—'}</code></dd>
              <dt>Weaknesses</dt>
              <dd>
                {cve.weaknesses.length
                  ? cve.weaknesses.map((cwe) => (
                    <a
                      key={cwe}
                      className="tag"
                      href={`https://cwe.mitre.org/data/definitions/${cwe.replace('CWE-', '')}.html`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {cwe}
                    </a>
                  ))
                  : '—'}
              </dd>
            </dl>
            <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noreferrer">
              View on nvd.nist.gov ↗
            </a>
          </Card>

          {watchItem && (
            <Card title="Remediation">
              <RemediationControls
                item={watchItem}
                canAssign={isAdmin}
                onChange={(changes) => update(cve.id, changes)}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
