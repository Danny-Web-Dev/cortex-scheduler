import type { AppointmentScope } from '@cortex/shared';

// Single source of truth for React Query cache keys.
// Prefix key for invalidating a doctor's slots across every date at once.
const slotsByDoctor = (doctorId: string) => ['doctors', doctorId, 'slots'] as const;

export const queryKeys = {
  specialties: () => ['specialties'] as const,
  doctors: (specialtyId: string) => ['specialties', specialtyId, 'doctors'] as const,
  slotsByDoctor,
  slots: (doctorId: string, date: string) => [...slotsByDoctor(doctorId), date] as const,
  myAppointments: (scope: AppointmentScope) => ['me', 'appointments', scope] as const,
  // Prefix key for invalidating every scope at once (react-query matches by prefix).
  myAppointmentsAll: () => ['me', 'appointments'] as const,
  search: (q: string) => ['search', q] as const,
};

// Mutation keys let sibling units observe in-flight mutations via useIsMutating.
export const mutationKeys = {
  bookSlot: ['book-slot'] as const,
};
