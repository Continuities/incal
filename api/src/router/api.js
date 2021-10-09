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
  removeSponsor,
  getAnchors
} from '../service/user.js';
import { sanitise } from '../service/db.js';
import { canSponsor } from '../service/sponsorship.js';

import type { Router } from 'express';
import type { User } from '../service/user.js';

const withAnchorSponsors = async user => ({
  ...user,
  sponsors: !user.isAnchor 
    ? user.sponsors 
    : (await getAnchors())
      .filter(a => a.email !== user.email)
});


export default () => {
  const router:Router<> = express.Router();

  // Someone else's profile
  router.get('/user/:email', async (req, res) => {
    const { email } = req.params;
    const currentUser:User = req.session.user;
    const user = await getUser(email);
    if (!user) {
      return res.sendStatus(404);
    }

    const actions = [];
    await canSponsor(user, currentUser) && actions.push('request_sponsor');
    await canSponsor(currentUser, user) && actions.push('sponsor');
    user.sponsors.find(s => s.email === currentUser.email) && actions.push('remove_sponsor');

    res.json(
      sanitise(
        await withAnchorSponsors({
          ...user,
          actions
        })
      )
    );
  });

  // Your profile
  router.get('/user', async (req, res) => {
    res.json(
      sanitise(
        await withAnchorSponsors({
          ...req.session.user,
          actions: []
        })
      )
    );
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
    const user = await getUser(email);
    const sponsor = await getUser(sponsorEmail);
    const valid = await canSponsor(sponsor, user);

    if (!valid) {
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