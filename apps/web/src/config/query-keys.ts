import type { AppointmentScope } from '@cortex/shared';

// Single source of truth for React Query cache keys.
export const queryKeys = {
  specialties: () => ['specialties'] as const,
  doctors: (specialtyId: string) => ['specialties', specialtyId, 'doctors'] as const,
  slots: (doctorId: string, date: string) => ['doctors', doctorId, 'slots', date] as const,
  myAppointments: (scope: AppointmentScope) => ['me', 'appointments', scope] as const,
  search: (q: string) => ['search', q] as const,
};

// Mutation keys let sibling units observe in-flight mutations via useIsMutating.
export const mutationKeys = {
  bookSlot: ['book-slot'] as const,
};
