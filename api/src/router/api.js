/**
 * JSON API endpoints
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import Busboy from 'busboy';
import { 
  getUser, 
  getUsers, 
  addSponsor,
  removeSponsor,
  getAnchors,
  addAnchor,
  removeAnchor,
  saveUser,
  removeUser,
  updatePhoto
} from '../service/user.js';
import {
  savePhoto
} from '../service/public.js';
import { sanitise } from '../service/db.js';
import { 
  canSponsor, 
  saveInvite,
} from '../service/sponsorship.js';
import { sendInvite } from '../service/mail.js';

import type { User } from '../service/user.js';

const withAnchorSponsors = async user => ({
  ...user,
  sponsors: !user.isAnchor 
    ? user.sponsors 
    : (await getAnchors())
      .filter(a => a.email !== user.email)
});

export default ():any => {
  const router = express.Router();

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
    if (currentUser.tags.includes('anchor')) {
      user.tags.includes('anchor') && actions.push('remove_anchor');
      !user.tags.includes('anchor') && actions.push('add_anchor');
    }

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
    const { user } = req.session;
    const actions = [];

    await canSponsor(user) && actions.push('invite_sponsee');

    res.json(
      sanitise(
        await withAnchorSponsors({
          ...req.session.user,
          actions
        })
      )
    );
  });

  // All users
  router.get('/users', async (req, res) => {
    const users = await getUsers();
    res.json(users.map(sanitise));
  });

  // Invite a sponsee
  router.put('/user/sponsees/:email', async (req, res) => {
    const { email } = req.params;
    const { user: currentUser } = req.session;
    if (!email) { // TODO: Validate email
      return res.status(400).send('Invalid email');
    }

    if (!await canSponsor(currentUser)) {
      return res.status(400).send('Cannot sponsor more members')
    }

    if (await getUser(email)) {
      return res.status(400).send('Email already in use');
    }
    
    await saveUser({
      email: email,
      sponsors: [ currentUser.email ]
    });

    const invite = await saveInvite(currentUser.email, email);
    await sendInvite(invite);

    req.session.user = await getUser(req.session.user.email);

    res.sendStatus(204);
  });

  // Cancel an invite
  router.delete('/user/sponsees/:email', async (req, res) => {
    const { email } = req.params;
    const { user: currentUser } = req.session;
    if (!email) {
      return res.status(400).send('Param email required');
    }

    const user = await getUser(email);
    if (!user) {
      return res.status(400).send('No such invite');
    }

    if (!user.sponsors.find(s => s.email === currentUser.email)) {
      return res.status(401)
    }

    await removeUser(email);
    req.session.user = await getUser(req.session.user.email);
    res.sendStatus(204);
  });

  router.put('/user/photo', (req, res) => {
    const bus = new Busboy({ headers: req.headers });
    
    const filePromise = new Promise(resolve => 
      bus.on('file', async (fieldname, file, filename, encoding, mimetype) => 
        resolve(await savePhoto(file, mimetype.substring(mimetype.indexOf('/') + 1)))));
    const uploadPromise = new Promise(resolve =>
      bus.on('finish', resolve));

    Promise.all([ filePromise, uploadPromise ])
      .then(([ photo ]) => updatePhoto(req.session.user.email, photo))
      .then(() => {
        res.writeHead(204, { 'Connection': 'close' });
        res.end();
      });
    return req.pipe(bus);
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

    await addSponsor(email, sponsorEmail);
    req.session.user = await getUser(req.session.user.email);
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

    await removeSponsor(email, sponsorEmail);
    req.session.user = await getUser(req.session.user.email);
    res.sendStatus(204);
  });

  // Make someone an anchor
  router.put('/anchors/:email', async (req, res) => {
    const { email } = req.params;
    if (!req.session.user.tags.includes('anchor')) {
      return res.sendStatus(401);
    }

    const user = await getUser(email);
    if (!user || user.tags.includes('anchor')) {
      return res.sendStatus(400);
    }

    await addAnchor(email);
    req.session.user = await getUser(req.session.user.email);
    res.sendStatus(204);
  });

  // Remoke an anchor
  router.delete('/anchors/:email', async (req, res) => {
    const { email } = req.params;
    if (!req.session.user.tags.includes('anchor')) {
      return res.sendStatus(401);
    }

    const user = await getUser(email);
    if (!user || !user.tags.includes('anchor')) {
      return res.sendStatus(400);
    }

    await removeAnchor(email);
    req.session.user = await getUser(req.session.user.email);
    res.sendStatus(204);
  });

  return router;
};