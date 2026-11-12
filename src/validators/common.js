import { z } from 'zod';

export const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const isoDate = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value));
