// userAggregateRouter.js
import { Router } from 'express';

/**
 * 生SQL版 /userAggregate ルータ
 * - 依存: users(id, name, email, created_at) テーブル
 * - いろいろな集計クエリを type パラメータで出し分ける
 */
export default function userAggregateRouter(knex) {
  const r = Router();

  // GET /userAggregate?type=total|by_domain|by_day|by_month ...
  r.get('/', async (req, res) => {
    const { type, from, to } = req.query || {};
    const params = [];
    let sql = '';

    // 共通の期間フィルタ（created_at）を付けたい場合
    const whereConds = [];
    if (from && to) {
      whereConds.push('created_at BETWEEN ? AND ?');
      params.push(from, to);
    } else if (from) {
      whereConds.push('created_at >= ?');
      params.push(from);
    } else if (to) {
      whereConds.push('created_at <= ?');
      params.push(to);
    }
    const where = whereConds.length ? `WHERE ${whereConds.join(' AND ')}` : '';

    // 【後期Day8課題】case 'total'を参考に、各caseのSQLを考えて書く。
    // ※ ${where} には WHERE ～～ というWHERE句が入っている。
    switch (type) {
      case 'total':
        // ユーザー総数
        sql = `
          SELECT COUNT(*) AS total_users
          FROM users
          ${where}
        `;
        break;

      case 'by_domain':
        // email のドメイン別ユーザー数
        sql = `
          
        `;
        break;

      case 'by_day':
        // 日別の登録数
        sql = `
          
        `;
        break;

      case 'by_month':
        // 月別の登録数
        sql = `
          
        `;
        break;

      default:
        return res.status(400).json({ error: 'invalid type' });
    }

    try {
      const [rows] = await knex.raw(sql, params);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return r;
}
