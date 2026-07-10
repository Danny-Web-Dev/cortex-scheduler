import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/book/specialty', label: 'Book', match: '/book' },
  { to: '/appointments', label: 'Appointments' },
];

export const AppLayout = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const { pathname } = useLocation();

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-bold text-brand-700">
            Cortex
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.match ?? item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:inline">{user?.phone}</span>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
