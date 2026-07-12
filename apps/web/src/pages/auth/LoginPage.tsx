import { Card } from '@/components/ui';
import { OtpLoginProvider } from '@/state/auth';
import { LoginHeader, LoginStepForm } from '@/components/auth';

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
