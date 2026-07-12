import { useOtpLoginContext } from './OtpLoginProvider';
import { PhoneStepForm } from './PhoneStepForm';
import { CodeStepForm } from './CodeStepForm';
import { NameStepForm } from './NameStepForm';

export const LoginStepForm = () => {
  const { step } = useOtpLoginContext();

  if (step === 'phone') return <PhoneStepForm />;
  if (step === 'code') return <CodeStepForm />;
  return <NameStepForm />;
};
