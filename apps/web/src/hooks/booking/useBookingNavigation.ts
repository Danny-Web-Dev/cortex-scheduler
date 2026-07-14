import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config';

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
