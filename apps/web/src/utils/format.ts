const SECONDS_PER_MINUTE = 60;

export const formatSlotTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export const formatFullDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

export const localTimeZoneLabel = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatCountdown = (totalSeconds: number): string => {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / SECONDS_PER_MINUTE);
  const seconds = clamped % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const LOCAL_PREFIX_LENGTH = 3;
const LOCAL_MAX_DIGITS = 10;

export const formatPhoneInput = (raw: string): string => {
  const allowed = raw.replace(/[^\d+-]/g, '');
  if (allowed.startsWith('+')) return allowed;
  const digits = allowed.replace(/-/g, '').slice(0, LOCAL_MAX_DIGITS);
  if (digits.length <= LOCAL_PREFIX_LENGTH) return digits;
  return `${digits.slice(0, LOCAL_PREFIX_LENGTH)}-${digits.slice(LOCAL_PREFIX_LENGTH)}`;
};
