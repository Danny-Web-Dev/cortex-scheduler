import { useMutation } from '@tanstack/react-query';
import type { HoldAppointmentInput } from '@cortex/shared';
import { client } from '@/api';
import { mutationKeys } from '@/config';

export const useHoldAppointmentMutation = () =>
  useMutation({
    mutationKey: mutationKeys.bookSlot,
    mutationFn: (input: HoldAppointmentInput) => client.appointments.hold(input),
  });
