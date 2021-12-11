
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import { getUser } from './service/auth.js';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app:any = express();

app.use(cors());
app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));

app.get('/login', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    res.sendStatus(400);
  }
  console.log(`TODO: Login with code ${code} state ${state}`);
});

app.get('/user', async (req, res) => {
  try {
    const user = await getUser();
    res.send(JSON.stringify(user));
  }
  catch (e) {
    res.sendStatus(401);
  }
});

app.use('/', async (req, res) => res.send('Hello from sleep'));

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;

