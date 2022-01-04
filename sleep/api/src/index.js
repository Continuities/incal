
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getUser, getToken } from './service/auth.js';
import { 
  getPlaces, 
  getPlace, 
  createPlace, 
  reservePlace 
} from './service/place.js';
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

// TODO: Protect routes with authorisation

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

app.get('/place', async (req, res) => {
  try {
    const places = await getPlaces();
    res.send(JSON.stringify(places));
  }
  catch (e) {
    console.log(e);
    res.sendStatus(500)
  }
});

app.get('/place/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const place = await getPlace(id);
    if (!place) {
      return res.sendStatus(404);
    }
    res.send(JSON.stringify(place));
  }
  catch (e) {
    console.log(e);
    res.sendStatus(500)
  }
});

app.post('/place', async (req, res) => {
  try {
    const place = await createPlace(req.body);
    res.send(JSON.stringify(place));
  }
  catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

app.post('/place/:placeId/booking', async (req, res) => {
  const {
    placeId
  } = req.params;
  if (!placeId) {
    return res.status(400).send('Missing placeId');
  }

  const user = await getUser(req.user);

  if (!user || user.email !== req.body.guestId) {
    return res.sendStatus(401);
  }

  try {
    const booking = await reservePlace(placeId, req.body);
    res.send(JSON.stringify(booking));
  }
  catch(e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

app.use('/', async (req, res) => res.send('Hello from sleep'));

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;

