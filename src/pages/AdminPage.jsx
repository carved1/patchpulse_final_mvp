import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { TEAM_MEMBERS } from '../utils/demoUsers';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import RemediationControls from '../components/RemediationControls';
import SeverityBadge from '../components/SeverityBadge';
import StatCard from '../components/StatCard';

export default function AdminPage() {
  const { items, update } = useWatchlist();
  const unassigned = items.filter((item) => !item.assignee && item.status !== 'patched');
  const patched = items.filter((item) => item.status === 'patched').length;

  return (
    <div className="page">
      <PageHeader title="Admin" subtitle="Manage the team and assign vulnerabilities to analysts." />

      <div className="stat-grid">
        <StatCard label="Team members" value={TEAM_MEMBERS.length} />
        <StatCard label="Tracked CVEs" value={items.length} />
        <StatCard label="Unassigned & open" value={unassigned.length} tone={unassigned.length ? 'high' : 'neutral'} />
        <StatCard label="Patched" value={patched} tone="low" />
      </div>

      <div className="dashboard-grid">
        <Card title="Assignments">
          {items.length === 0 ? (
            <p className="muted">
              No CVEs are being tracked yet. Analysts add them from the <Link to="/cves">Browse</Link> page.
            </p>
          ) : (
            <ul className="assignment-list">
              {items.map((item) => (
                <li key={item.cveId} className="assignment-list__item">
                  <div className="watchlist__heading">
                    <Link to={`/cves/${item.cveId}`} className="cve-card__id">{item.cveId}</Link>
                    <SeverityBadge severity={item.snapshot.severity} score={item.snapshot.score} />
                  </div>
                  <RemediationControls
                    item={item}
                    canAssign
                    onChange={(changes) => update(item.cveId, changes)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Team">
          <ul className="team-list">
            {TEAM_MEMBERS.map((member) => {
              const assigned = items.filter((item) => item.assignee === member.name);
              const open = assigned.filter((item) => item.status !== 'patched').length;
              return (
                <li key={member.id} className="team-list__item">
                  <div className="team-list__identity">
                    <strong>{member.name}</strong>
                    <span className="muted">{member.email}</span>
                  </div>
                  <div className="team-list__meta">
                    <span className={`role-pill role-pill--${member.role}`}>{member.role}</span>
                    <span className="muted">{open} open / {assigned.length} assigned</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
