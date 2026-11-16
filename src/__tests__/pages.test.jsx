import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { normalizeCve } from '../utils/cveFormatters';
import { makeRawCve } from '../test/fixtures';
import { renderApp, signInAs } from '../test/renderWithProviders';

const feedCves = [
  normalizeCve(makeRawCve({ id: 'CVE-2026-1001', severity: 'CRITICAL', score: 9.8, published: '2026-11-15T00:00:00.000' })),
  normalizeCve(makeRawCve({ id: 'CVE-2026-1002', severity: 'LOW', score: 3.1, published: '2026-11-14T00:00:00.000' })),
  normalizeCve(makeRawCve({ id: 'CVE-2026-1003', severity: 'HIGH', score: 7.5, published: '2026-11-13T00:00:00.000' })),
];

function api({ fetchFeed, fetchOne } = {}) {
  return {
    fetchFeed: fetchFeed ?? vi.fn().mockResolvedValue({ cves: feedCves, totalResults: 42 }),
    fetchOne: fetchOne ?? vi.fn(),
  };
}

describe('LoginPage', () => {
  it('shows validation errors for an empty submit', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/login' });

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('shows an error for wrong credentials', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/login' });

    await user.type(screen.getByLabelText('Email'), 'analyst@patchpulse.dev');
    await user.type(screen.getByLabelText('Password'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });

  it('signs in and lands on the dashboard with live data', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/login', cveDataProps: api() });

    await user.type(screen.getByLabelText('Email'), 'analyst@patchpulse.dev');
    await user.type(screen.getByLabelText('Password'), 'patchpulse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: /welcome back, avery/i })).toBeInTheDocument();
    expect(await screen.findByText('42')).toBeInTheDocument();
  });
});

describe('BrowsePage', () => {
  it('shows a loading state, then the fetched CVEs', async () => {
    signInAs('analyst');
    renderApp({ route: '/cves', cveDataProps: api() });

    expect(screen.getByRole('status')).toHaveTextContent(/searching the nvd/i);
    expect(await screen.findByRole('link', { name: 'CVE-2026-1001' })).toBeInTheDocument();
    expect(screen.getByText(/showing 3 of 42/i)).toBeInTheDocument();
  });

  it('filters results by severity', async () => {
    const user = userEvent.setup();
    signInAs('analyst');
    renderApp({ route: '/cves', cveDataProps: api() });
    await screen.findByRole('link', { name: 'CVE-2026-1001' });

    await user.click(screen.getByRole('checkbox', { name: 'Low' }));

    const results = screen.getByRole('region', { name: 'Search results' });
    expect(within(results).getByRole('link', { name: 'CVE-2026-1002' })).toBeInTheDocument();
    expect(within(results).queryByRole('link', { name: 'CVE-2026-1001' })).not.toBeInTheDocument();
  });

  it('sends a debounced keyword search to the API', async () => {
    const user = userEvent.setup();
    const fetchFeed = vi.fn().mockResolvedValue({ cves: feedCves, totalResults: 3 });
    signInAs('analyst');
    renderApp({ route: '/cves', cveDataProps: api({ fetchFeed }) });
    await screen.findByRole('link', { name: 'CVE-2026-1001' });

    await user.type(screen.getByLabelText('Keyword'), 'openssl');

    await waitFor(() => expect(fetchFeed).toHaveBeenLastCalledWith({ days: 3, keyword: 'openssl' }));
    expect(fetchFeed).toHaveBeenCalledTimes(2);
  });

  it('shows an error with a working retry button', async () => {
    const user = userEvent.setup();
    const fetchFeed = vi
      .fn()
      .mockRejectedValueOnce(new Error('NVD is down'))
      .mockResolvedValueOnce({ cves: feedCves, totalResults: 3 });
    signInAs('analyst');
    renderApp({ route: '/cves', cveDataProps: api({ fetchFeed }) });

    expect(await screen.findByRole('alert')).toHaveTextContent('NVD is down');
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('link', { name: 'CVE-2026-1001' })).toBeInTheDocument();
  });
});

describe('CveDetailPage', () => {
  it('fetches a CVE on direct visit and shows patch guidance', async () => {
    const fetchOne = vi.fn().mockResolvedValue(feedCves[0]);
    signInAs('analyst');
    renderApp({ route: '/cves/CVE-2026-1001', cveDataProps: api({ fetchOne }) });

    expect(await screen.findByRole('heading', { name: 'CVE-2026-1001' })).toBeInTheDocument();
    expect(fetchOne).toHaveBeenCalledWith('CVE-2026-1001');
    expect(screen.getByRole('heading', { name: 'How to Patch' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://example.com/patch' })).toBeInTheDocument();
  });

  it('adding to the watchlist updates the navbar badge and shows remediation controls', async () => {
    const user = userEvent.setup();
    signInAs('analyst');
    renderApp({ route: '/cves/CVE-2026-1001', cveDataProps: api({ fetchOne: vi.fn().mockResolvedValue(feedCves[0]) }) });

    await screen.findByRole('heading', { name: 'CVE-2026-1001' });
    expect(screen.getByLabelText('0 saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add CVE-2026-1001 to watchlist/i }));

    expect(screen.getByLabelText('1 saved')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Remediation' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status'), 'patched');
    await user.click(screen.getByRole('link', { name: /watchlist/i }));
    expect(await screen.findByText('Patched', { selector: '.status-pill' })).toBeInTheDocument();
  });

  it('rejects malformed CVE ids without calling the API', () => {
    const fetchOne = vi.fn();
    signInAs('analyst');
    renderApp({ route: '/cves/not-a-cve', cveDataProps: api({ fetchOne }) });

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid cve id/i);
    expect(fetchOne).not.toHaveBeenCalled();
  });
});
