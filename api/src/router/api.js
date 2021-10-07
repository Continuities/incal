/**
 * JSON API endpoints
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import { 
  getUser, 
  getUsers, 
  addSponsor,
  removeSponsor
} from '../service/user.js';

import type { Router } from 'express';
import type { User } from '../service/user.js';

const secrets = new Set([ 'hash', '_id' ]);
const sanitise = (data:any):any =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([ key, val ]) => !secrets.has(key)));

const userResponse = async (res, email) => {
  const user = await getUser(email);
    if (!user) {
      return res.sendStatus(404);
    }
    res.json(sanitise(user));
};

export default () => {
  const router:Router<> = express.Router();

  // Someone else's profile
  router.get('/user/:email', async (req, res) => {
    const { email } = req.params;
    return userResponse(res, email);
  });

  // Your profile
  router.get('/user', async (req, res) => {
    return userResponse(res, req.session.user.email);
  });

  // All users
  router.get('/users', async (req, res) => {
    const users = await getUsers();
    res.json(users.map(sanitise));
  });

  // Add a sponsor
  // TODO: Sponsorship approval
  router.put('/user/:email/sponsors/:sponsorEmail', async (req, res) => {
    const { email, sponsorEmail } = req.params;
    if (!email || !sponsorEmail) {
      return res.sendStatus(400);
    }
    const user:?User = await getUser(email);
    const sponsor = await getUser(sponsorEmail);
    if (!user || !sponsor) {
      return res.sendStatus(400);
    }

    // TODO: Cycle prevention
    // TODO: Max sponsees
    if (user.sponsors.length >= (parseInt(process.env.MAX_SPONSORS) || 0) ||
        user.sponsors.find(s => s.email === sponsorEmail) || 
        sponsor.sponsors.find(s => s.email === email)) {
      return res.sendStatus(400);
    }

    addSponsor(email, sponsorEmail);
    res.sendStatus(204);
  });

  // Remove a sponsor
  router.delete('/user/:email/sponsors/:sponsorEmail', async (req, res) => {
    const { email, sponsorEmail } = req.params;
    if (!email || !sponsorEmail) {
      return res.sendStatus(400);
    }
    const user:?User = await getUser(email);
    const sponsor = await getUser(sponsorEmail);
    if (!user || !sponsor) {
      return res.sendStatus(400);
    }

    if (!user.sponsors.find(s => s.email === sponsorEmail)) {
      return res.sendStatus(400);
    }

    removeSponsor(email, sponsorEmail);
    res.sendStatus(204);
  });

  return router;
};