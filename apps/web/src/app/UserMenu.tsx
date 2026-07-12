import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks';

export const UserMenu = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-subtitle sm:inline">{user?.name ?? user?.phone}</span>
      <Button variant="ghost" onClick={logout}>
        {t('app.logout')}
      </Button>
    </div>
  );
};
