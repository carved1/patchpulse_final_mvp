import { Link } from 'react-router-dom';
import { formatDate, truncate } from '../utils/cveFormatters';
import SeverityBadge from './SeverityBadge';
import WatchlistButton from './WatchlistButton';

export default function CveCard({ cve }) {
  return (
    <article className="cve-card">
      <div className="cve-card__top">
        <Link to={`/cves/${cve.id}`} className="cve-card__id">
          {cve.id}
        </Link>
        <SeverityBadge severity={cve.severity} score={cve.score} />
      </div>
      <p className="cve-card__description">{truncate(cve.description)}</p>
      <div className="cve-card__footer">
        <span className="cve-card__meta">
          Published {formatDate(cve.published)} · {cve.status}
        </span>
        <WatchlistButton cve={cve} compact />
      </div>
    </article>
  );
}
