import { Router } from 'express';

/**
 * 生SQL版 /users ルータ
 * - 依存: users(id, name, email, created_at) テーブル
 * - すべて knex.raw( SQL, [params] ) で実装
 */
export default function usersRawRouter(knex) {
  const r = Router();

  // 作成: POST /users  { name, email }
  r.post('/', async (req, res) => {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    try {
      await knex.transaction(async (trx) => {
        // INSERT（生SQL）
        await trx.raw(
          'INSERT INTO users (name, email) VALUES (?, ?)',
          [name, email]
        );

        // 同一コネクションで LAST_INSERT_ID() を取得
        const [rows] = await trx.raw('SELECT LAST_INSERT_ID() AS id');
        const id = Array.isArray(rows) ? rows[0]?.id : rows?.id;

        // 返却用に再取得
        const [userRows] = await trx.raw('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
        const user = Array.isArray(userRows) ? userRows[0] : userRows;

        res.status(201).json(user);
      });
    } catch (e) {
      // email UNIQUE などの制約違反もここで拾える
      return res.status(500).json({ error: e.message });
    }
  });

  // 一覧: GET /users
  r.get('/', async (_req, res) => {
    const [rows] = await knex.raw('SELECT id, name, email, created_at FROM users ORDER BY id ASC');
    res.json(rows);
  });

  // 検索: GET /users/search
  // 検索方法(例)：GET /users/search?name_like=ta&from=2024-01-01&to=2025-12-31&domains=gmail.com,yahoo.co.jp
  r.get('/search', async (req, res) => {
    const { name_like, from, to, domains } = req.query || {};
    const conds = [];
    const params = [];

    if (name_like) { conds.push('name LIKE ?'); params.push(`%${name_like}%`); }
    if (from && to) { conds.push('created_at BETWEEN ? AND ?'); params.push(from, to); }
    else if (from) { conds.push('created_at >= ?'); params.push(from); }
    else if (to) { conds.push('created_at <= ?'); params.push(to); }

    if (domains) {
      const list = String(domains).split(',').map(s => s.trim()).filter(Boolean);
      if (list.length) {
        conds.push(`SUBSTRING_INDEX(email, '@', -1) IN (${list.map(_=>'?').join(',')})`);
        params.push(...list);
      }
    }

    // where には WHERE句が入る
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const [rows] = await knex.raw(
      `SELECT id, name, email, created_at FROM users ${where} ORDER BY created_at DESC`, params
    );
    res.json(rows);
  });

  // 取得: GET /users/:id
  r.get('/:id(\\d+)', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

    const [rows] = await knex.raw(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    const user = rows?.[0];
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  });

  // 更新: PATCH /users/:id  { name?, email? }
  r.patch('/:id(\\d+)', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

    const { name, email } = req.body || {};
    const updates = [];
    const params = [];

    if (typeof name === 'string') { updates.push('name = ?'); params.push(name); }
    if (typeof email === 'string') { updates.push('email = ?'); params.push(email); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'no updatable fields' });
    }

    try {
      await knex.transaction(async (trx) => {
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);
        const [result] = await trx.raw(sql, params);

        // MySQL の affectedRows を見る代わりに再取得で存在チェック
        const [rows] = await trx.raw(
          'SELECT id, name, email, created_at FROM users WHERE id = ?',
          [id]
        );
        const user = rows?.[0];
        if (!user) return res.status(404).json({ error: 'not found' });

        res.json(user);
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  // 削除: DELETE /users/:id
  r.delete('/:id(\\d+)', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

    const [result] = await knex.raw('DELETE FROM users WHERE id = ?', [id]);
    // 204でボディなし
    return res.status(204).end();
  });

  return r;
}
