import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp, signInAs } from '../test/renderWithProviders';

const emptyFeed = () => ({
  fetchFeed: vi.fn().mockResolvedValue({ cves: [], totalResults: 0 }),
  fetchOne: vi.fn(),
});

describe('routing', () => {
  it('redirects unauthenticated users from protected routes to /login', () => {
    renderApp({ route: '/watchlist' });
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders the 404 page for unknown URLs', () => {
    renderApp({ route: '/this/does/not/exist' });
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByText('/this/does/not/exist')).toBeInTheDocument();
  });

  it('hides the Admin link from analysts and blocks /admin', async () => {
    signInAs('analyst');
    renderApp({ route: '/admin', cveDataProps: emptyFeed() });

    expect(await screen.findByText(/you need the admin role/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('nav__link--active');
  });

  it('shows the Admin link and page to admins', () => {
    signInAs('admin');
    renderApp({ route: '/admin', cveDataProps: emptyFeed() });

    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
  });

  it('renders the watchlist route with an empty state', () => {
    signInAs('analyst');
    renderApp({ route: '/watchlist', cveDataProps: emptyFeed() });
    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
  });
});
