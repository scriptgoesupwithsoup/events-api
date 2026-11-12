import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Маршрут ${req.method} ${req.originalUrl} не найден`));
}

// Централизованная обработка ошибок: единый JSON-формат { error: { status, message, details? } }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Внутренняя ошибка сервера';
  let details;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Некорректный JSON в теле запроса';
  } else if (err.type === 'entity.too.large') {
    status = 400;
    message = 'Слишком большое тело запроса';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      status = 409;
      message = 'Запись с такими уникальными значениями уже существует';
    } else if (err.code === 'P2003') {
      status = 409;
      message = 'Операция нарушает связи между записями';
    } else if (err.code === 'P2025') {
      status = 404;
      message = 'Запись не найдена';
    }
  }

  // Подробности внутренних ошибок пишем только в лог сервера, клиенту не отдаём
  if (status === 500) console.error(err);

  const body = { error: { status, message } };
  if (details) body.error.details = details;
  res.status(status).json(body);
}
