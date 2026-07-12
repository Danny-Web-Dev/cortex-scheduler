import { useMutation } from '@tanstack/react-query';
import type { RescheduleAppointmentInput } from '@cortex/shared';
import { client } from '@/api';
import { mutationKeys } from '@/config';

type RescheduleAppointmentArgs = { id: string; input: RescheduleAppointmentInput };

// Shares mutationKeys.bookSlot with useHoldAppointmentMutation so
// SlotReservingIndicator's useIsMutating check catches either one in flight.
export const useRescheduleAppointmentMutation = () =>
  useMutation({
    mutationKey: mutationKeys.bookSlot,
    mutationFn: ({ id, input }: RescheduleAppointmentArgs) => client.appointments.reschedule(id, input),
  });
