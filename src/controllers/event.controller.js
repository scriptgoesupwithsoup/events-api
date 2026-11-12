import * as eventService from '../services/event.service.js';

export async function list(req, res) {
  res.status(200).json(await eventService.list(req.valid.query));
}

export async function getById(req, res) {
  res.status(200).json(await eventService.getById(req.valid.params.id));
}

export async function create(req, res) {
  res.status(201).json(await eventService.create(req.valid.body, req.user.id));
}

export async function update(req, res) {
  res.status(200).json(await eventService.update(req.valid.params.id, req.valid.body));
}

export async function remove(req, res) {
  await eventService.remove(req.valid.params.id);
  res.status(200).json({ message: 'Мероприятие удалено' });
}
