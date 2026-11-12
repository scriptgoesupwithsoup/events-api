import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

// validate({ params, query, body }) — проверяет запрос по схемам Zod.
// Результат кладётся в req.valid.{params,query,body}; в контроллерах используются только эти данные.
export const validate = (schemas) => (req, res, next) => {
  try {
    req.valid = {};
    if (schemas.params) req.valid.params = schemas.params.parse(req.params);
    if (schemas.query) req.valid.query = schemas.query.parse(req.query);
    if (schemas.body) req.valid.body = schemas.body.parse(req.body ?? {});
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => ({
        field: issue.path.join('.') || '(body)',
        message: issue.message,
      }));
      return next(new ApiError(400, 'Ошибка валидации входных данных', details));
    }
    next(err);
  }
};
