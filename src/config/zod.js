import { z } from 'zod';

const typeNames = {
  string: 'строка',
  number: 'число',
  boolean: 'логическое значение',
  object: 'объект',
  array: 'массив',
};

// Русские сообщения об ошибках валидации
const ruErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') return { message: 'Обязательное поле' };
      return { message: `Ожидается тип: ${typeNames[issue.expected] ?? issue.expected}` };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') return { message: `Минимальная длина — ${issue.minimum} симв.` };
      if (issue.type === 'number') {
        return {
          message: issue.inclusive
            ? `Значение не должно быть меньше ${issue.minimum}`
            : `Значение должно быть больше ${issue.minimum}`,
        };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `Максимальная длина — ${issue.maximum} симв.` };
      if (issue.type === 'number') return { message: `Значение не должно превышать ${issue.maximum}` };
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'Некорректный email' };
      if (issue.validation === 'datetime') {
        return { message: 'Ожидается дата ISO 8601, например 2026-12-01T10:00:00Z' };
      }
      break;
    case z.ZodIssueCode.unrecognized_keys:
      return { message: `Неизвестные поля: ${issue.keys.join(', ')}` };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Допустимые значения: ${issue.options.join(', ')}` };
    default:
      break;
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(ruErrorMap);
