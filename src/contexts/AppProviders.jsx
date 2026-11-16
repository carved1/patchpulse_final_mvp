import AuthProvider from './AuthProvider';
import CveDataProvider from './CveDataProvider';
import WatchlistProvider from './WatchlistProvider';

export default function AppProviders({ children, cveDataProps = {} }) {
  return (
    <AuthProvider>
      <CveDataProvider {...cveDataProps}>
        <WatchlistProvider>{children}</WatchlistProvider>
      </CveDataProvider>
    </AuthProvider>
  );
}
