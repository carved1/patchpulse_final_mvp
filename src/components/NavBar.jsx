import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist';

export default function NavBar({ id, onNavigate }) {
  const { isAdmin } = useAuth();
  const { count } = useWatchlist();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/cves', label: 'Browse CVEs', end: true },
    { to: '/watchlist', label: 'Watchlist', badge: count },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav id={id} className="nav" aria-label="Primary">
      <ul className="nav__list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
            >
              {link.label}
              {link.badge !== undefined && (
                <span className="nav__badge" aria-label={`${link.badge} saved`}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
