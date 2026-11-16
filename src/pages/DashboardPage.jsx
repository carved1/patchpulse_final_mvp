import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist';
import { useCveFeed } from '../hooks/useCveFeed';
import { countBySeverity } from '../utils/cveFormatters';
import { filterCves } from '../utils/filterCves';
import Card from '../components/Card';
import CveList from '../components/CveList';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import SeverityChart from '../components/SeverityChart';
import StatCard from '../components/StatCard';

const DASHBOARD_DAYS = 3;

export default function DashboardPage() {
  const { user } = useAuth();
  const { items } = useWatchlist();
  const location = useLocation();
  const { cves, totalResults, isLoading, error, retry } = useCveFeed({ days: DASHBOARD_DAYS });

  const counts = useMemo(() => countBySeverity(cves), [cves]);
  const urgent = useMemo(
    () => filterCves(cves, { severities: ['CRITICAL', 'HIGH'], sort: 'score' }).slice(0, 5),
    [cves],
  );
  const openItems = items.filter((item) => item.status !== 'patched').length;

  return (
    <div className="page">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle="Vulnerabilities published to the NVD in the last 72 hours."
      >
        <Link to="/cves" className="button button--primary">Browse all CVEs</Link>
      </PageHeader>

      {location.state?.denied && (
        <p className="notice" role="status">
          You need the Admin role to open {location.state.denied}.
        </p>
      )}

      {isLoading && <LoadingSpinner label="Fetching the latest CVEs from the NVD…" />}
      {error && <ErrorMessage title="Could not load CVEs" message={error} onRetry={retry} />}

      {!isLoading && !error && (
        <>
          <div className="stat-grid">
            <StatCard label="New CVEs (72h)" value={totalResults.toLocaleString()} hint={`${cves.length} loaded`} />
            <StatCard label="Critical" value={counts.CRITICAL} tone="critical" />
            <StatCard label="High" value={counts.HIGH} tone="high" />
            <StatCard label="Open in watchlist" value={openItems} hint={`${items.length} saved`} />
          </div>

          <div className="dashboard-grid">
            <Card title="Most severe new CVEs" actions={<Link to="/cves">View all</Link>}>
              <CveList cves={urgent} emptyMessage="No critical or high severity CVEs in this window." />
            </Card>
            <Card title="Severity distribution">
              <SeverityChart counts={counts} />
              {counts.UNKNOWN > 0 && (
                <p className="muted">{counts.UNKNOWN} CVEs are awaiting a CVSS score.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
