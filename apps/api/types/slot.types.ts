export type AvailabilityWindow = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type OccupyingAppointment = {
  startsAt: Date;
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  holdExpiresAt: Date | null;
};

export type ComputeFreeSlotsArgs = {
  availability: AvailabilityWindow[];
  appointments: OccupyingAppointment[];
  date: string;
  tz: string;
  durationMin: number;
  now: Date;
};
