import { useMutation } from '@tanstack/react-query';
import type { RescheduleAppointmentInput } from '@cortex/shared';
import { client } from '@/api';
import { mutationKeys } from '@/config';

type RescheduleAppointmentArgs = { id: string; input: RescheduleAppointmentInput };

export const useRescheduleAppointmentMutation = () =>
  useMutation({
    mutationKey: mutationKeys.bookSlot,
    mutationFn: ({ id, input }: RescheduleAppointmentArgs) => client.appointments.reschedule(id, input),
  });
