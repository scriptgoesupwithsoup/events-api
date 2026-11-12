import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Проверяет заголовок Authorization: Bearer <accessToken>.
// Пользователь заново читается из БД, поэтому роль всегда актуальна,
// а токен удалённого пользователя перестаёт работать.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Требуется авторизация: передайте заголовок Authorization: Bearer <accessToken>');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Срок действия токена истёк');
    throw new ApiError(401, 'Недействительный токен');
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId)) throw new ApiError(401, 'Недействительный токен');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new ApiError(401, 'Пользователь токена не найден');

  req.user = user;
  next();
});
