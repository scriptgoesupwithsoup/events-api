import { ApiError } from '../utils/ApiError.js';

// Используется после requireAuth: requireRole('admin')
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Требуется авторизация'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Недостаточно прав для выполнения операции'));
    }
    next();
  };
