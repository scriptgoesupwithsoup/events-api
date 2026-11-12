import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const eventBrief = { select: { id: true, title: true, startsAt: true, endsAt: true } };

// Запись на мероприятие. userId приходит из req.user.id (подтверждённый токен).
// Строка мероприятия блокируется FOR UPDATE, чтобы параллельные запросы не превысили вместимость.
export async function register(eventId, userId) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw`SELECT id FROM events WHERE id = ${eventId} FOR UPDATE`;
    if (locked.length === 0) throw new ApiError(404, 'Мероприятие не найдено');

    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (event.endsAt < new Date()) throw new ApiError(409, 'Мероприятие уже завершилось');

    const duplicate = await tx.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (duplicate) throw new ApiError(409, 'Вы уже записаны на это мероприятие');

    const taken = await tx.registration.count({ where: { eventId } });
    if (taken >= event.capacity) throw new ApiError(409, 'Свободных мест на мероприятии нет');

    return tx.registration.create({
      data: { userId, eventId },
      include: { event: eventBrief },
    });
  });
}

// Связанный запрос: мои записи вместе с мероприятием и площадкой
export function listMine(userId) {
  return prisma.registration.findMany({
    where: { userId },
    orderBy: { event: { startsAt: 'asc' } },
    select: {
      id: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          venue: { select: { id: true, name: true, address: true } },
        },
      },
    },
  });
}

export async function listByEvent(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, 'Мероприятие не найдено');

  return prisma.registration.findMany({
    where: { eventId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// Отмена: владелец — свою запись, admin — любую
export async function cancel(id, currentUser) {
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) throw new ApiError(404, 'Запись не найдена');

  if (registration.userId !== currentUser.id && currentUser.role !== 'admin') {
    throw new ApiError(403, 'Можно отменить только свою запись');
  }
  await prisma.registration.delete({ where: { id } });
}
