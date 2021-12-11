
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import { getUser, getToken } from './service/auth.js';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app:any = express();

app.use(cors());
app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));

app.get('/login', async (req, res) => {
  console.log('Beginning login flow for query', req.query);
  const { code, state } = req.query;
  if (!code || !state) {
    return res.sendStatus(400);
  }
  
  // TODO: Get original state from cookie

  const token = await getToken(code, state);
  if (!token) {
    return res.sendStatus(401);
  }

  console.log('Got token', token);

  res.sendStatus(200);
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

