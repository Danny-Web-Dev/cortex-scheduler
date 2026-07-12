import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { NavLinks } from './NavLinks';
import { UserMenu } from './UserMenu';

export const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
        <Link to={ROUTES.dashboard} className="text-lg font-bold text-brand-700">
          {t('app.brand')}
        </Link>
        <NavLinks />
        <UserMenu />
      </div>
    </header>
  );
};
