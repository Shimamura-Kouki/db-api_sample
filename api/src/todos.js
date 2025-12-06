import { Router } from 'express';

export default function todosRouter(knex) {
  const r = Router();

  // 作成: POST /todos  { title, user_id }
  r.post('/', async (req, res) => {
    const { title, user_id } = req.body || {};

    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    // user_id を必須にするかどうかは方針次第
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // INSERT
    const [id] = await knex('todos').insert({
      title,
      done: 0,
      user_id, // 追加
    });

    const row = await knex('todos').where({ id }).first();
    res.status(201).json(row);
  });

  // 一覧: GET /todos or GET /todos?userId=1
  r.get('/', async (req, res) => {
    const { userId } = req.query || {};

    const q = knex('todos').select('*');

    if (userId) {
      q.where({ user_id: userId });
    }

    const rows = await q.orderBy('id', 'desc');
    res.json(rows);
  });

  // 取得: GET /todos/:id
  r.get('/:id', async (req, res) => {
    const row = await knex('todos')
      .where({ id: req.params.id })
      .first();

    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });

  // 更新: PATCH /todos/:id  { title?, done? }
  r.patch('/:id', async (req, res) => {
    const { title, done } = req.body || {};
    const updates = {};

    if (typeof title === 'string') updates.title = title;
    if (typeof done === 'boolean') updates.done = done ? 1 : 0;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'no updatable fields' });
    }

    const count = await knex('todos')
      .where({ id: req.params.id })
      .update(updates);

    if (!count) return res.status(404).json({ error: 'not found' });

    const row = await knex('todos')
      .where({ id: req.params.id })
      .first();

    res.json(row);
  });

  // 削除: DELETE /todos/:id
  r.delete('/:id', async (req, res) => {
    const count = await knex('todos')
      .where({ id: req.params.id })
      .del();

    if (!count) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  return r;
}
