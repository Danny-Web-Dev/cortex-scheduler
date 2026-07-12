import { Trans } from 'react-i18next';
import { Callout } from '@/components/ui';
import { useOtpLoginContext } from './OtpLoginProvider';

export const DevCodeHint = () => {
  const { devCode } = useOtpLoginContext();

  if (!devCode) return null;
  return (
    <Callout tone="brand" className="px-3 py-2">
      <Trans
        i18nKey="auth.code.devCode"
        values={{ code: devCode }}
        components={{ code: <span className="font-mono font-bold" /> }}
      />
    </Callout>
  );
};
