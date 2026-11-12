import { z } from 'zod';

const venueFields = z
  .object({
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().min(3).max(255),
    capacity: z.number().int().positive().max(1000000),
  })
  .strict();

export const createVenueBody = venueFields;

export const updateVenueBody = venueFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Передайте хотя бы одно поле для изменения' });
