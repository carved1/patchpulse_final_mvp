import { useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useCveFeed } from '../hooks/useCveFeed';
import { filterCves, paginate } from '../utils/filterCves';
import CveList from '../components/CveList';
import ErrorMessage from '../components/ErrorMessage';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS = { query: '', severities: [], days: 3, sort: 'newest' };

export default function BrowsePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const keyword = useDebounce(filters.query, 500);

  const { cves, totalResults, isLoading, isRefreshing, error, retry } = useCveFeed({
    days: filters.days,
    keyword,
  });

  const visible = useMemo(
    () => filterCves(cves, { severities: filters.severities, sort: filters.sort }),
    [cves, filters.severities, filters.sort],
  );
  const { pageItems, totalPages, currentPage } = paginate(visible, page, PAGE_SIZE);

  const updateFilters = (changes) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setPage(1);
  };

  const toggleSeverity = (severity) => {
    setFilters((prev) => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter((s) => s !== severity)
        : [...prev.severities, severity],
    }));
    setPage(1);
  };

  return (
    <div className="page">
      <PageHeader
        title="Browse CVEs"
        subtitle="Search the NVD by keyword, then narrow by severity and publish date."
      />

      <div className="browse-layout">
        <aside className="browse-layout__filters">
          <FilterPanel
            query={filters.query}
            onQueryChange={(query) => updateFilters({ query })}
            severities={filters.severities}
            onToggleSeverity={toggleSeverity}
            days={filters.days}
            onDaysChange={(days) => updateFilters({ days })}
            sort={filters.sort}
            onSortChange={(sort) => updateFilters({ sort })}
            onReset={() => updateFilters(DEFAULT_FILTERS)}
          />
        </aside>

        <section className="browse-layout__results" aria-label="Search results">
          {isLoading && <LoadingSpinner label="Searching the NVD…" />}
          {error && <ErrorMessage title="Search failed" message={error} onRetry={retry} />}

          {!isLoading && !error && (
            <>
              <p className="results-summary" aria-live="polite">
                Showing {visible.length} of {totalResults.toLocaleString()} matching CVEs
                {cves.length < totalResults && ` (newest ${cves.length} loaded)`}
                {isRefreshing && ' · refreshing…'}
              </p>
              <CveList cves={pageItems} />
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
