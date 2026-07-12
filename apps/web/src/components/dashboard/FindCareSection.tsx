import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui';
import { SearchBar } from '@/components/search';

export const FindCareSection = () => {
  const { t } = useTranslation();

  return (
    <section>
      <SectionHeading>{t('dashboard.findCare')}</SectionHeading>
      <SearchBar />
    </section>
  );
};
