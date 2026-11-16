import { Link, useLocation } from 'react-router-dom';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p className="muted">
        Nothing lives at <code>{pathname}</code>. It may have been moved, or the link is mistyped.
      </p>
      <Link to="/dashboard" className="button button--primary">Back to the dashboard</Link>
    </div>
  );
}
