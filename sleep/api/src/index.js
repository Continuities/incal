
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Busboy from 'busboy';
import { 
  getUser, 
  getToken,
  secured
} from './service/auth.js';
import { 
  getPlaces, 
  getPlace, 
  getBookings,
  createPlace, 
  reservePlace,
  cancelReservation
} from './service/place.js';
import MemoryStore from 'simple-memory-storage';
import { v4 as uuid } from 'uuid';
import { Rule } from './service/rule.js';
import { savePhoto } from './service/public.js';

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

app.use(async (req, res, next) => {
  const { session } = req.cookies;
  if (session) {
    req.user = await getUser(tokens.get(session));
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

app.get('/user', secured(), async (req, res) => {
  try {
    res.send(JSON.stringify(req.user));
  }
  catch (e) {
    console.log(e);
    res.sendStatus(401);
  }
});

app.get('/place', secured(), async (req, res) => {
  try {
    const { guest } = req.query;
    const places = await (guest ? getBookings(guest) : getPlaces());
    res.send(JSON.stringify(places));
  }
  catch (e) {
    console.log(e);
    res.sendStatus(500)
  }
});

app.get('/place/:id', secured(), async (req, res) => {
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

app.post('/place', secured([ 
  Rule.hasTag('can-create') 
]), async (req, res) => {
  try {
    const place = await createPlace({
      ...req.body,
      owner: req.user.email
    });
    res.send(JSON.stringify(place));
  }
  catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

app.post('/place/:placeId/booking', secured(), async (req, res) => {
  const {
    placeId
  } = req.params;
  if (!placeId) {
    return res.status(400).send('Missing placeId');
  }

  if (!req.user || req.user.email !== req.body.guestId) {
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

app.delete('/place/:placeId/booking/:bookingId', secured(), async (req, res) => {
  const {
    placeId,
    bookingId
  } = req.params;

  if (!placeId || !bookingId) {
    return res.sendStatus(400);
  }

  try {
    await cancelReservation(placeId, bookingId);
    res.sendStatus(204);
  }
  catch(e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

app.post('/photo', secured([ Rule.hasTag('can-create') ]), (req, res) => {
  const bus = new Busboy({ headers: req.headers });
  const { email } = req.user;
  
  const filePromise = new Promise(resolve => 
    bus.on('file', async (fieldname, file, filename, encoding, mimetype) => 
      resolve(await savePhoto(file, mimetype.substring(mimetype.indexOf('/') + 1)))));

  const uploadPromise = new Promise(resolve =>
    bus.on('finish', resolve));

  Promise.all([ filePromise, uploadPromise ])
    .then(([ photo ]) => {
      res.set('Connection', 'close');
      res.send({ filename: photo });
    });
  return req.pipe(bus);
});

app.use('/public', express.static(String(process.env.PUBLIC_PATH)));

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;

