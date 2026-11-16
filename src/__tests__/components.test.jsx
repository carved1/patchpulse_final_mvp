import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Card from '../components/Card';
import CveCard from '../components/CveCard';
import CveList from '../components/CveList';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SeverityBadge from '../components/SeverityBadge';
import ErrorMessage from '../components/ErrorMessage';
import { normalizeCve } from '../utils/cveFormatters';
import { makeRawCve } from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';

const cve = normalizeCve(makeRawCve({ id: 'CVE-2026-4242', severity: 'CRITICAL', score: 9.8 }));

describe('SeverityBadge', () => {
  it('renders the severity and formatted score', () => {
    render(<SeverityBadge severity="CRITICAL" score={9.8} />);
    expect(screen.getByText('CRITICAL')).toHaveClass('severity--critical');
    expect(screen.getByText('9.8')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('composes a title, actions and children', () => {
    render(
      <Card title="Hello" actions={<button type="button">Act</button>}>
        <p>Body content</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CveCard', () => {
  it('links to the detail route and shows the description', () => {
    renderWithProviders(<CveCard cve={cve} />);
    expect(screen.getByRole('link', { name: 'CVE-2026-4242' })).toHaveAttribute('href', '/cves/CVE-2026-4242');
    expect(screen.getByText(/Buffer overflow in ExampleLib/)).toBeInTheDocument();
  });

  it('toggles watchlist membership through context', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CveCard cve={cve} />);

    const button = screen.getByRole('button', { name: /add CVE-2026-4242 to watchlist/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(screen.getByRole('button', { name: /remove CVE-2026-4242 from watchlist/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('CveList', () => {
  it('shows an empty state when there are no CVEs', () => {
    renderWithProviders(<CveList cves={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('FilterPanel', () => {
  it('reports user interactions through its callbacks', async () => {
    const user = userEvent.setup();
    const handlers = {
      onQueryChange: vi.fn(),
      onToggleSeverity: vi.fn(),
      onDaysChange: vi.fn(),
      onSortChange: vi.fn(),
      onReset: vi.fn(),
    };
    render(<FilterPanel query="" severities={['HIGH']} days={3} sort="newest" {...handlers} />);

    expect(screen.getByRole('checkbox', { name: 'High' })).toBeChecked();

    await user.type(screen.getByLabelText('Keyword'), 'x');
    expect(handlers.onQueryChange).toHaveBeenCalledWith('x');

    await user.click(screen.getByRole('checkbox', { name: 'Critical' }));
    expect(handlers.onToggleSeverity).toHaveBeenCalledWith('CRITICAL');

    await user.selectOptions(screen.getByLabelText('Published'), '7');
    expect(handlers.onDaysChange).toHaveBeenCalledWith(7);

    await user.selectOptions(screen.getByLabelText('Sort by'), 'score');
    expect(handlers.onSortChange).toHaveBeenCalledWith('score');

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(handlers.onReset).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('disables Previous on the first page and moves forward on Next', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ErrorMessage', () => {
  it('calls onRetry when the retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage message="Boom" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
