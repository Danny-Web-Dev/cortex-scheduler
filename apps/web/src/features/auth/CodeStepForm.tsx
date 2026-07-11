import { useState, type FormEvent } from 'react';
import { Button, Callout, Input } from '@/components/ui';

type CodeStepFormProps = {
  devCode: string | null;
  loading: boolean;
  error?: string | null;
  onSubmit: (code: string) => string | null;
  onUseDifferentNumber: () => void;
};

export const CodeStepForm = ({
  devCode,
  loading,
  error,
  onSubmit,
  onUseDifferentNumber,
}: CodeStepFormProps) => {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(onSubmit(code.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {devCode && (
        <Callout tone="brand" className="px-3 py-2">
          Dev code: <span className="font-mono font-bold">{devCode}</span>
        </Callout>
      )}
      <Input
        id="code"
        label="Verification code"
        placeholder="123456"
        inputMode="numeric"
        maxLength={6}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={localError ?? error ?? undefined}
      />
      <Button type="submit" loading={loading} className="w-full">
        Verify &amp; sign in
      </Button>
      <button
        type="button"
        onClick={onUseDifferentNumber}
        className="w-full text-sm text-ink-500 hover:text-ink-700"
      >
        Use a different number
      </button>
    </form>
  );
};
