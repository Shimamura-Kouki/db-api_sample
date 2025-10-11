import { Router } from 'express';

export default function todosRouter(knex) {
  const r = Router();

  r.post('/', async (req, res) => {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
    const [id] = await knex('todos').insert({ title, done: 0 });
    const row = await knex('todos').where({ id }).first();
    res.status(201).json(row);
  });

  r.get('/', async (_req, res) => {
    const rows = await knex('todos').select('*').orderBy('id', 'desc');
    res.json(rows);
  });

  r.get('/:id', async (req, res) => {
    const row = await knex('todos').where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });

  r.patch('/:id', async (req, res) => {
    const { title, done } = req.body;
    const updates = {};
    if (typeof title === 'string') updates.title = title;
    if (typeof done === 'boolean') updates.done = done ? 1 : 0;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'no updatable fields' });
    const count = await knex('todos').where({ id: req.params.id }).update(updates);
    if (!count) return res.status(404).json({ error: 'not found' });
    const row = await knex('todos').where({ id: req.params.id }).first();
    res.json(row);
  });

  r.delete('/:id', async (req, res) => {
    const count = await knex('todos').where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  return r;
}
