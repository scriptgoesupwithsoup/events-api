import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export function list() {
  return prisma.venue.findMany({ orderBy: { id: 'asc' } });
}

// Связанный запрос: площадка вместе с её мероприятиями (Prisma select)
export async function getById(id) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      events: {
        select: { id: true, title: true, startsAt: true, endsAt: true },
        orderBy: { startsAt: 'asc' },
      },
    },
  });
  if (!venue) throw new ApiError(404, 'Площадка не найдена');
  return venue;
}

export function create(data) {
  return prisma.venue.create({ data });
}

export async function update(id, data) {
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) throw new ApiError(404, 'Площадка не найдена');

  if (data.capacity !== undefined) {
    const tooBig = await prisma.event.findFirst({
      where: { venueId: id, capacity: { gt: data.capacity } },
      select: { id: true, title: true },
    });
    if (tooBig) {
      throw new ApiError(409, `Нельзя уменьшить вместимость: мероприятие «${tooBig.title}» (id=${tooBig.id}) рассчитано на большее число мест`);
    }
  }
  return prisma.venue.update({ where: { id }, data });
}

export async function remove(id) {
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) throw new ApiError(404, 'Площадка не найдена');

  const eventsCount = await prisma.event.count({ where: { venueId: id } });
  if (eventsCount > 0) {
    throw new ApiError(409, 'Нельзя удалить площадку: на ней запланированы мероприятия');
  }
  await prisma.venue.delete({ where: { id } });
}
