import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { formatPhoneInput } from '@/lib';

type PhoneStepFormProps = {
  loading: boolean;
  error?: string | null;
  onSubmit: (phone: string) => string | null;
};

export const PhoneStepForm = ({ loading, error, onSubmit }: PhoneStepFormProps) => {
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(onSubmit(phone.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="phone"
        label="Phone number"
        placeholder="054-1234567"
        inputMode="tel"
        autoFocus
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        error={localError ?? error ?? undefined}
      />
      <Button type="submit" loading={loading} className="w-full">
        Send code
      </Button>
    </form>
  );
};
