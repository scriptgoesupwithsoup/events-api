import { z } from 'zod';
import { isoDate } from './common.js';

const eventFields = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().max(2000).nullable().optional(),
    startsAt: isoDate,
    endsAt: isoDate,
    capacity: z.number().int().positive().max(1000000),
    venueId: z.number().int().positive(),
  })
  .strict();

const endAfterStart = (data) => !(data.startsAt && data.endsAt) || data.endsAt > data.startsAt;
const endAfterStartMessage = { message: 'endsAt должен быть позже startsAt', path: ['endsAt'] };

export const createEventBody = eventFields.refine(endAfterStart, endAfterStartMessage);

export const updateEventBody = eventFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Передайте хотя бы одно поле для изменения' })
  .refine(endAfterStart, endAfterStartMessage);

export const listEventsQuery = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  venueId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
