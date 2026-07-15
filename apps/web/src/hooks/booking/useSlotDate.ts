import { useSearchParams } from 'react-router-dom';

const tomorrowIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA');
};

export const useSlotDate = () => {
  const [params, setParams] = useSearchParams();
  const date = params.get('date') ?? tomorrowIso();

  const setDate = (next: string) =>
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set('date', next);
        return nextParams;
      },
      { replace: true },
    );

  return { date, setDate };
};
