// Express 4 не перехватывает ошибки async-функций, поэтому оборачиваем обработчики
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
