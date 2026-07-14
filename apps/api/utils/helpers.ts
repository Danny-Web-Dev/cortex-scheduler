// General-purpose pure functions with no other natural home.
export const slotKeyFor = (doctorId: string, startsAtIso: string): string =>
  `${doctorId}#${startsAtIso}`;
