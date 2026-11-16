import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NavBar from './NavBar';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="brand">
          <span className="brand__mark" aria-hidden="true">◆</span>
          PatchPulse
        </Link>

        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="header__toggle"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="visually-hidden">Toggle navigation</span>
              <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            </button>

            <div className={`header__menu ${menuOpen ? 'header__menu--open' : ''}`}>
              <NavBar id="primary-navigation" onNavigate={() => setMenuOpen(false)} />
              <div className="header__user">
                <span className="header__user-name">{user.name}</span>
                <span className={`role-pill role-pill--${user.role}`}>{user.role}</span>
                <button type="button" className="button button--ghost" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link to="/login" className="button button--primary">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
