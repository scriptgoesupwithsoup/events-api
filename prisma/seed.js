import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const hash = (password) => argon2.hash(password, { type: argon2.argon2id });
const daysFromNow = (days, hour) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User12345';

  // Администратор создаётся только здесь: через публичную регистрацию получить роль admin нельзя
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: 'Администратор', role: 'admin', passwordHash: await hash(adminPassword) },
  });
  const anna = await prisma.user.upsert({
    where: { email: 'anna@example.com' },
    update: {},
    create: { email: 'anna@example.com', name: 'Анна Сатпаева', role: 'user', passwordHash: await hash(userPassword) },
  });
  const timur = await prisma.user.upsert({
    where: { email: 'timur@example.com' },
    update: {},
    create: { email: 'timur@example.com', name: 'Тимур Омаров', role: 'user', passwordHash: await hash(userPassword) },
  });

  // Повторный запуск seed не дублирует данные
  if ((await prisma.venue.count()) === 0) {
    const hall = await prisma.venue.create({ data: { name: 'Конференц-зал «Алатау»', address: 'г. Алматы, пр. Аль-Фараби, 77', capacity: 200 } });
    const lab = await prisma.venue.create({ data: { name: 'Коворкинг «Хаб»', address: 'г. Алматы, ул. Тимирязева, 42', capacity: 50 } });
    await prisma.venue.create({ data: { name: 'Открытая площадка в парке', address: 'г. Алматы, парк Первого Президента', capacity: 500 } });

    const meetup = await prisma.event.create({
      data: { title: 'Meetup по Node.js', description: 'Доклады о REST API и Prisma', startsAt: daysFromNow(7, 10), endsAt: daysFromNow(7, 13), capacity: 100, venueId: hall.id, createdById: admin.id },
    });
    const workshop = await prisma.event.create({
      data: { title: 'Воркшоп по PostgreSQL', description: 'Практика: индексы и транзакции', startsAt: daysFromNow(14, 9), endsAt: daysFromNow(14, 12), capacity: 2, venueId: lab.id, createdById: admin.id },
    });
    await prisma.event.create({
      data: { title: 'Хакатон колледжа', description: 'Командная разработка за один день', startsAt: daysFromNow(30, 9), endsAt: daysFromNow(30, 18), capacity: 150, venueId: hall.id, createdById: admin.id },
    });

    await prisma.registration.createMany({
      data: [
        { userId: anna.id, eventId: meetup.id },
        { userId: timur.id, eventId: meetup.id },
        { userId: anna.id, eventId: workshop.id },
      ],
    });
  }

  console.log('Seed выполнен. Администратор:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
