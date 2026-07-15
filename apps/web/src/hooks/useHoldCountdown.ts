import { useEffect, useState } from 'react';
import { formatCountdown } from '@/utils';

const MS_PER_SECOND = 1000;

const computeSecondsLeft = (holdExpiresAt: string): number =>
  Math.max(0, Math.round((new Date(holdExpiresAt).getTime() - Date.now()) / MS_PER_SECOND));

export const useHoldCountdown = (holdExpiresAt: string) => {
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(holdExpiresAt));

  useEffect(() => {
    setSecondsLeft(computeSecondsLeft(holdExpiresAt));
    const id = setInterval(() => setSecondsLeft(computeSecondsLeft(holdExpiresAt)), MS_PER_SECOND);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  return { secondsLeft, isExpired: secondsLeft <= 0, label: formatCountdown(secondsLeft) };
};
