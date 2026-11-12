import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const withCount = ({ _count, ...event }) => ({ ...event, registeredCount: _count.registrations });

export async function list({ from, to, venueId, page, limit }) {
  const where = {};
  if (venueId) where.venueId = venueId;
  if (from || to) {
    where.startsAt = {};
    if (from) where.startsAt.gte = from;
    if (to) where.startsAt.lte = to;
  }

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        venue: { select: { id: true, name: true, address: true } },
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  return {
    data: events.map(withCount),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Связанный запрос Prisma include: мероприятие + площадка + автор + число записей
export async function getById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
  });
  if (!event) throw new ApiError(404, 'Мероприятие не найдено');
  return withCount(event);
}

async function assertVenueFits(venueId, capacity) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) throw new ApiError(404, 'Площадка не найдена');
  if (capacity > venue.capacity) {
    throw new ApiError(400, `Вместимость мероприятия (${capacity}) превышает вместимость площадки (${venue.capacity})`);
  }
}

export async function create(data, creatorId) {
  await assertVenueFits(data.venueId, data.capacity);
  // createdById берётся из подтверждённого токена, а не из тела запроса
  const event = await prisma.event.create({
    data: { ...data, createdById: creatorId },
    include: { venue: { select: { id: true, name: true, address: true } } },
  });
  return event;
}

export async function update(id, data) {
  const existing = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!existing) throw new ApiError(404, 'Мероприятие не найдено');

  const startsAt = data.startsAt ?? existing.startsAt;
  const endsAt = data.endsAt ?? existing.endsAt;
  if (endsAt <= startsAt) throw new ApiError(400, 'endsAt должен быть позже startsAt');

  const venueId = data.venueId ?? existing.venueId;
  const capacity = data.capacity ?? existing.capacity;
  await assertVenueFits(venueId, capacity);

  if (capacity < existing._count.registrations) {
    throw new ApiError(409, `Нельзя установить вместимость ${capacity}: уже записано ${existing._count.registrations} участников`);
  }

  return prisma.event.update({
    where: { id },
    data,
    include: { venue: { select: { id: true, name: true, address: true } } },
  });
}

export async function remove(id) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Мероприятие не найдено');
  // записи участников удаляются каскадом (onDelete: Cascade)
  await prisma.event.delete({ where: { id } });
}
