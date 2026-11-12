import * as venueService from '../services/venue.service.js';

export async function list(req, res) {
  res.status(200).json({ data: await venueService.list() });
}

export async function getById(req, res) {
  res.status(200).json(await venueService.getById(req.valid.params.id));
}

export async function create(req, res) {
  res.status(201).json(await venueService.create(req.valid.body));
}

export async function update(req, res) {
  res.status(200).json(await venueService.update(req.valid.params.id, req.valid.body));
}

export async function remove(req, res) {
  await venueService.remove(req.valid.params.id);
  res.status(200).json({ message: 'Площадка удалена' });
}
