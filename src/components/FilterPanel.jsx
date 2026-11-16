import { SEVERITIES } from '../utils/cveFormatters';
import { DAY_RANGES, SORT_OPTIONS } from '../utils/filterCves';

export default function FilterPanel({
  query,
  onQueryChange,
  severities,
  onToggleSeverity,
  days,
  onDaysChange,
  sort,
  onSortChange,
  onReset,
}) {
  return (
    <form className="filter-panel" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="field">
        <label htmlFor="cve-search">Keyword</label>
        <input
          id="cve-search"
          type="search"
          placeholder="e.g. openssl, wordpress, kernel"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <fieldset className="field">
        <legend>Severity</legend>
        <div className="checkbox-group">
          {SEVERITIES.map((severity) => (
            <label key={severity} className="checkbox">
              <input
                type="checkbox"
                checked={severities.includes(severity)}
                onChange={() => onToggleSeverity(severity)}
              />
              {severity.charAt(0) + severity.slice(1).toLowerCase()}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="cve-days">Published</label>
        <select id="cve-days" value={days} onChange={(event) => onDaysChange(Number(event.target.value))}>
          {DAY_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cve-sort">Sort by</label>
        <select id="cve-sort" value={sort} onChange={(event) => onSortChange(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="button button--ghost" onClick={onReset}>
        Reset filters
      </button>
    </form>
  );
}
