export const HOLD_TTL_MIN = 5;

export const slotKeyFor = (doctorId: string, startsAtIso: string): string =>
  `${doctorId}#${startsAtIso}`;
