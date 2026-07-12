import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config';

// The specialty→doctor and doctor→slot transitions are triggered from several
// places (the step pages, the dashboard's browse section, doctor cards) —
// centralized here so each call site doesn't rebuild the ROUTES call itself.
export const useBookingNavigation = () => {
  const navigate = useNavigate();

  return {
    goToDoctors: (specialtyId: string): void => {
      void navigate(ROUTES.book.doctorWithSpecialty({ specialtyId }));
    },
    goToSlots: (specialtyId: string, doctorId: string): void => {
      void navigate(ROUTES.book.slotWithDoctor({ specialtyId, doctorId }));
    },
  };
};
