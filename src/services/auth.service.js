import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const publicUser = { id: true, email: true, name: true, role: true, createdAt: true };

// Хеш-заглушка: login тратит одинаковое время для существующего и несуществующего email
const DUMMY_HASH = await argon2.hash('dummy-password', { type: argon2.argon2id });

export async function register({ email, name, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Пользователь с таким email уже зарегистрирован');

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  // Роль не берётся из запроса: публичная регистрация всегда создаёт роль user
  return prisma.user.create({
    data: { email, name, passwordHash, role: 'user' },
    select: publicUser,
  });
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = await argon2.verify(user ? user.passwordHash : DUMMY_HASH, password);

  if (!user || !isValid) throw new ApiError(401, 'Неверный email или пароль');

  const accessToken = jwt.sign({ role: user.role }, env.jwtSecret, {
    algorithm: 'HS256',
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: env.jwtExpiresIn,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
  };
}
