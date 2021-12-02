
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getUser, getToken } from './service/auth.js';
import MemoryStore from 'simple-memory-storage';
import { v4 as uuid } from 'uuid';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app:any = express();

const tokens = new MemoryStore();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const { session } = req.cookies;
  if (session) {
    req.user = tokens.get(session);
  }
  next();
});

app.get('/login', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.sendStatus(400);
  }
  
  const originalState = req.cookies.state;
  if (originalState !== state) {
    return res.sendStatus(401);
  }

  const token = await getToken(code);
  if (!token) {
    return res.sendStatus(401);
  }

  const sessionId = uuid();
  tokens.setExpiration(
    sessionId, 
    token, 
    new Date(Date.now() + (token.expires_in * 1000))
  );

  res.cookie('session', sessionId, {
    maxAge: parseInt(process.env.SESSION_TIME || 86400),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.sendStatus(200);
});

app.get('/user', async (req, res) => {
  try {
    const user = await getUser(req.user);
    res.send(JSON.stringify(user));
  }
  catch (e) {
    console.log(e);
    res.sendStatus(401);
  }
});

app.use('/', async (req, res) => res.send('Hello from sleep'));

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;

