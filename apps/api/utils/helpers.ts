export const slotKeyFor = (doctorId: string, startsAtIso: string): string =>
  `${doctorId}#${startsAtIso}`;
