import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../utils/validation';
import Card from '../components/Card';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__intro">
        <h1>Triage new CVEs in minutes.</h1>
        <p>
          PatchPulse turns the National Vulnerability Database into a live feed your team can
          filter, save, and track through to “patched.”
        </p>
      </div>

      <Card title="Sign in" className="login__card">
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <span id="email-error" className="field__error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="field__error">{errors.password}</span>
            )}
          </div>

          {submitError && (
            <p className="form__error" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" className="button button--primary button--block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login__demo">
          <p>Demo accounts (password <code>patchpulse</code>):</p>
          <ul>
            <li><code>analyst@patchpulse.dev</code> (Analyst)</li>
            <li><code>admin@patchpulse.dev</code> (Admin)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
