import { z } from 'zod';

// Поле role намеренно отсутствует: .strict() вернёт 400, если клиент попытается его передать
export const registerBody = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    name: z.string().trim().min(2).max(100),
    password: z.string().min(8).max(128),
  })
  .strict();

export const loginBody = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(128),
  })
  .strict();
