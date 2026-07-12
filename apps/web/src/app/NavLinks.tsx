import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cx } from '@/lib';

const NAV = [
  { to: '/dashboard', labelKey: 'app.nav.dashboard', match: '/dashboard' },
  { to: '/book/specialty', labelKey: 'app.nav.book', match: '/book' },
  { to: '/appointments', labelKey: 'app.nav.appointments', match: '/appointments' },
] as const;

export const NavLinks = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
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
  );
};
