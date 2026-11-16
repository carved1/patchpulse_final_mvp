export default function SeverityBadge({ severity = 'UNKNOWN', score }) {
  const level = severity.toLowerCase();
  return (
    <span className={`severity severity--${level}`}>
      {severity}
      {score !== null && score !== undefined && <span className="severity__score">{score.toFixed(1)}</span>}
    </span>
  );
}
