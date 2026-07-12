import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { HoldToast } from '@/features/booking';
import { useAuth, useLogout } from '@/hooks';
import { cx } from '@/lib';

const NAV = [
  { to: '/dashboard', labelKey: 'app.nav.dashboard', match: '/dashboard' },
  { to: '/book/specialty', labelKey: 'app.nav.book', match: '/book' },
  { to: '/appointments', labelKey: 'app.nav.appointments', match: '/appointments' },
] as const;

export const AppLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const logout = useLogout();
  const { pathname } = useLocation();

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-bold text-brand-700">
            {t('app.brand')}
          </Link>
          <nav className="order-last flex w-full items-center gap-1 sm:order-0 sm:w-auto">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                    active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50',
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-subtitle sm:inline">{user?.name ?? user?.phone}</span>
            <Button variant="ghost" onClick={logout}>
              {t('app.logout')}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <HoldToast />
    </div>
  );
};
