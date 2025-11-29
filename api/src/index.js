import 'dotenv/config';
import express from 'express';
import knexConfig from '../knexfile.js';
import knexModule from 'knex';
import todosRouter from './todos.js';
import usersRawRouter from './users.js';
import userAggregateRouter from './userAggregate.js';

const app = express();
const knex = knexModule(knexConfig.development);

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await knex.raw('SELECT 1 AS ok');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'ng', error: String(e) });
  }
});

app.use('/todos', todosRouter(knex));
app.use('/users', usersRawRouter(knex));
app.use('/userAggregate', userAggregateRouter(knex));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
