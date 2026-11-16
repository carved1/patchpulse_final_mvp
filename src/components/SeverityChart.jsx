import { SEVERITIES } from '../utils/cveFormatters';

export default function SeverityChart({ counts }) {
  const max = Math.max(1, ...SEVERITIES.map((s) => counts[s] ?? 0));

  return (
    <ul className="severity-chart" aria-label="Severity distribution">
      {SEVERITIES.map((severity) => {
        const value = counts[severity] ?? 0;
        return (
          <li key={severity} className="severity-chart__row">
            <span className="severity-chart__label">{severity}</span>
            <span className="severity-chart__track">
              <span
                className={`severity-chart__bar severity-chart__bar--${severity.toLowerCase()}`}
                style={{ width: `${(value / max) * 100}%` }}
              />
            </span>
            <span className="severity-chart__value">{value}</span>
          </li>
        );
      })}
    </ul>
  );
}
