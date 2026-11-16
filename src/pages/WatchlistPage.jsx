import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCveData } from '../hooks/useCveData';
import { useWatchlist } from '../hooks/useWatchlist';
import { truncate } from '../utils/cveFormatters';
import { REMEDIATION_STATUSES, statusLabel } from '../utils/remediation';
import PageHeader from '../components/PageHeader';
import RemediationControls from '../components/RemediationControls';
import SeverityBadge from '../components/SeverityBadge';

export default function WatchlistPage() {
  const { items, update, remove } = useWatchlist();
  const { getCve } = useCveData();
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const visible = statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter);

  return (
    <div className="page">
      <PageHeader title="Watchlist" subtitle="Track saved CVEs from “To Do” through to “Patched.”">
        <div className="field field--inline">
          <label htmlFor="status-filter">Show</label>
          <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All ({items.length})</option>
            {REMEDIATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label} ({items.filter((item) => item.status === status.value).length})
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty.</p>
          <Link to="/cves" className="button button--primary">Find CVEs to watch</Link>
        </div>
      ) : (
        <ul className="watchlist">
          {visible.map((item) => {
            const cve = getCve(item.cveId) ?? { id: item.cveId, ...item.snapshot };
            return (
              <li key={item.cveId} className={`watchlist__item watchlist__item--${item.status}`}>
                <div className="watchlist__info">
                  <div className="watchlist__heading">
                    <Link to={`/cves/${item.cveId}`} className="cve-card__id">{item.cveId}</Link>
                    <SeverityBadge severity={cve.severity} score={cve.score} />
                    <span className="status-pill">{statusLabel(item.status)}</span>
                  </div>
                  <p className="muted">{truncate(cve.description, 140)}</p>
                  {item.assignee && <p className="watchlist__assignee">Assigned to {item.assignee}</p>}
                </div>
                <div className="watchlist__controls">
                  <RemediationControls
                    item={item}
                    canAssign={isAdmin}
                    onChange={(changes) => update(item.cveId, changes)}
                  />
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => remove(item.cveId)}
                    aria-label={`Remove ${item.cveId} from watchlist`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="empty-state">No CVEs with this status.</li>}
        </ul>
      )}
    </div>
  );
}
