import { useWatchlist } from '../hooks/useWatchlist';

export default function WatchlistButton({ cve, compact = false }) {
  const { isWatched, add, remove } = useWatchlist();
  const watched = isWatched(cve.id);

  const handleClick = () => (watched ? remove(cve.id) : add(cve));

  return (
    <button
      type="button"
      className={`button ${watched ? 'button--secondary' : 'button--primary'} ${compact ? 'button--small' : ''}`}
      aria-pressed={watched}
      aria-label={`${watched ? 'Remove' : 'Add'} ${cve.id} ${watched ? 'from' : 'to'} watchlist`}
      onClick={handleClick}
    >
      {watched ? '★ Watching' : '☆ Add to Watchlist'}
    </button>
  );
}
