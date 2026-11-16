export default function StatCard({ label, value, hint, tone = 'neutral' }) {
  return (
    <div className={`stat-card stat-card--${tone.toLowerCase()}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </div>
  );
}
