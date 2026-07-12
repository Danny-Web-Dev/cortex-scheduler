import { Card } from '@/components/ui';
import { OtpLoginProvider } from './OtpLoginProvider';
import { LoginHeader } from './LoginHeader';
import { LoginStepForm } from './LoginStepForm';

export const LoginPage = () => (
  <OtpLoginProvider>
    <div className="center-viewport px-4 py-12">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <LoginStepForm />
      </Card>
    </div>
  </OtpLoginProvider>
);
