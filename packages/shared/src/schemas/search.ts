import { z } from 'zod';
import { DoctorSchema, SpecialtySchema } from './appointment';

export const SEARCH_MIN_LENGTH = 2;

export const SearchQuerySchema = z.object({
  q: z.string().trim().min(SEARCH_MIN_LENGTH).max(100),
});

const SearchDoctorSchema = DoctorSchema.extend({ specialtyName: z.string() });

export const SearchResultSchema = z.object({
  specialties: z.array(SpecialtySchema),
  doctors: z.array(SearchDoctorSchema),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;
