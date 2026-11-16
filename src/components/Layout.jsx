import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" id="main-content">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
