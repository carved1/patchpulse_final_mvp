import CveCard from './CveCard';

export default function CveList({ cves, emptyMessage = 'No vulnerabilities match these filters.' }) {
  if (!cves.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="cve-list">
      {cves.map((cve) => (
        <li key={cve.id}>
          <CveCard cve={cve} />
        </li>
      ))}
    </ul>
  );
}
