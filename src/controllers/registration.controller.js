import * as registrationService from '../services/registration.service.js';

export async function register(req, res) {
  res.status(201).json(await registrationService.register(req.valid.params.id, req.user.id));
}

export async function listMine(req, res) {
  res.status(200).json({ data: await registrationService.listMine(req.user.id) });
}

export async function listByEvent(req, res) {
  res.status(200).json({ data: await registrationService.listByEvent(req.valid.params.id) });
}

export async function cancel(req, res) {
  await registrationService.cancel(req.valid.params.id, req.user);
  res.status(200).json({ message: 'Запись отменена' });
}
