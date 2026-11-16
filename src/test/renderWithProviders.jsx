import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import AppProviders from '../contexts/AppProviders';
import { AUTH_STORAGE_KEY } from '../contexts/AuthContext';
import { DEMO_USERS } from '../utils/demoUsers';

export function signInAs(role = 'analyst') {
  const { password: _password, ...user } = DEMO_USERS.find((u) => u.role === role);
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token: 'test-token' }));
  return user;
}

export function renderWithProviders(ui, { route = '/', cveDataProps } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders cveDataProps={cveDataProps}>{ui}</AppProviders>
    </MemoryRouter>,
  );
}

export function renderApp(options) {
  return renderWithProviders(<App />, options);
}
