/**
 * OAuth2 endpoints
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import { promises as fs } from 'fs';
import bcrypt from 'bcrypt';
import { getClient } from '../service/client.js';
import { getAnchors, getUser, saveUser, upgradeUser } from '../service/user.js';
import { getInvite, removeInvite } from '../service/sponsorship.js';
import { renderTemplate } from '../service/template.js';

import type { User } from '../service/user.js';

const COMMUNITY_NAME = process.env.COMMUNITY_NAME || 'INCAL';
const CSRF_TOKEN_EXPIRES_IN = 1000 * 60 * 2;// 2 minutes

const getRequestUrl = req => `${req.protocol}://${req.get('host')}${req.originalUrl}`;
const removeUserAction =  url => url.replace(/&?(deny|agree|logout|csrfToken)=[^&]+/g, '');
const forwardToLogin = async (res, callbackUri, error = null) => 
  forwardToView(res, 'login', {
    community: COMMUNITY_NAME,
    callbackUri: Buffer.from(callbackUri, 'utf-8').toString('base64'),
    loginUrl: `${String(process.env.SERVER_URI)}/oauth/login`,
    registerUrl: `${String(process.env.SERVER_URI)}/oauth/register`,
    error: error ?? ''
  });

const forwardToView = async (res, viewName:string, viewModel:{[string]:?string}) => {
  try {
    res
      .status(200)
      .send(await renderTemplate(viewName, viewModel));
  }
  catch(e) {
    res
      .status(500)
      .send(e);
  }
};

const isExpired = (time) => Date.now() >= time;

export default (oauth:any):any => {
  const router = express.Router();

  const withDefaultScope = (req) => {
    if (req.query.scope) {
      return req;
    }
    req.query.scope = 'user_info%3Aread';
    req.url = `${req.url}&scope=user_info%3read`;
    return req;
  }

  const checkLogin = async (req, res, next) => {
    const { 
      client_id, 
      csrfToken, 
      scope, 
      agree, 
      deny, 
      logout 
    } = withDefaultScope(req).query;
    const { 
      user, 
      userConfirmCsrfToken 
    } = req.session;
    
    if (!client_id || !scope) {
      return res.sendStatus(400);
    }
    const client = await getClient(client_id);
    if (!client) {
      return res.sendStatus(401);
    }

    const scopes = decodeURIComponent(scope)
      .split(',')
      .map(s => s.trim());

    const requestUrl = removeUserAction(getRequestUrl(req));

    if (!user) {
      return forwardToLogin(res, requestUrl);
    }
    
    if (csrfToken && 
        userConfirmCsrfToken && 
        userConfirmCsrfToken.token == csrfToken && 
        !isExpired(userConfirmCsrfToken.expiresAt) &&
        (agree || deny || logout)
    ) {
      if (deny) {
        await forwardToView(res, 'user-deny', {
          'clientName': client.name,
          'email': user.email
        });
      } 
      else if (logout) {
        req.session.user = null;
        return forwardToLogin(res, requestUrl);
      } 
      else {
        return next();
      }

      return;
    }

    const sessCsrfToken = {
      'token': `csrf-${Math.floor(Math.random() * 100000000)}`,
      'expiresAt': Date.now() + CSRF_TOKEN_EXPIRES_IN
    };

    req.session.userConfirmCsrfToken = sessCsrfToken;

    const scopeItems = scopes.map(s => {
      switch (s) {
        case 'user_info:read':
          return 'Read your user information';
        case 'user_info:write':
          return 'Change your user information';
      }
      return '';
    }).map(s => `<li>${s}</li>`).join('');

    return forwardToView(res, 'user-confirm', {
      'community': COMMUNITY_NAME,
      'email': user.email,
      'oauthUri': requestUrl,
      'csrfToken': sessCsrfToken.token,
      'clientName': client.name,
      'scopeItems': scopeItems
    });
  };

  router.get('/invite', async (req, res) => {
    const { slug } = req.query;
    const invite = await getInvite(slug);
    if (!invite) {
      return res.sendStatus(404);
    }
    const from = await getUser(invite.from);
    const to = await getUser(invite.to);

    if (!from || !to) {
      return res.status(500).send('Invite is invalid');
    }

    return forwardToView(res, 'invite', {
      community: COMMUNITY_NAME,
      fromName: `${from.firstname} ${from.lastname}`,
      fromEmail: from.email,
      to: to.email,
      slug,
      callbackUri: 'TODO'
    });
  });

  router.post('/invite', async (req, res) => {
    const { 
      callback_uri, 
      email,
      firstname,
      lastname,
      password,
      confirm,
      slug
    } = req.body;

    const invite = await getInvite(slug);
    if (!invite || invite.to !== email) {
      return res.status(400).send('invalid invite');
    }

    if (password !== confirm) {
      return res.status(400).send('passwords do not match');
    }

    const user = await getUser(email);
    if (!user) {
      return res.status(400).send('expired invite');
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    if (isNaN(saltRounds)) {
      throw 'Non-numeric SALT_ROUNDS specified';
    }
    const hash = await bcrypt.hash(password, saltRounds);

    await upgradeUser(email, firstname, lastname, hash);
    await removeInvite(slug);

    return forwardToLogin(res, String(process.env.SERVER_URI));
  });

  router.post('/register', async (req, res) => {
    const { 
      callback_uri, 
      email,
      firstname,
      lastname,
      password 
      // TODO: confirm
    } = req.body;

    if (!callback_uri || !email || !password || !firstname || !lastname){
      return res.sendStatus(400);
    }

    if (await getUser(email)) {
      return res.status(410).send('Email already in use');
    }

    const callbackUri = Buffer.from(callback_uri, 'base64').toString('utf-8');
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    if (isNaN(saltRounds)) {
      throw 'Non-numeric SALT_ROUNDS specified';
    }
    const hash = await bcrypt.hash(password, saltRounds);

    const isAnchor = (await getAnchors()).length === 0; 

    try {
      await saveUser({
        email,
        firstname,
        lastname,
        hash,
        sponsors: [],
        isAnchor
      });
    }
    catch (e) {
      return res.status(500).json(e)
    }

    return forwardToLogin(res, callbackUri);
  });

  router.post('/login', async (req, res) => {
    const { 
      callback_uri, 
      email, 
      password 
    } = req.body;

    if (!callback_uri || !email || !password){
      return res.sendStatus(400);
    }
    const callbackUri = Buffer.from(callback_uri, 'base64').toString('utf-8');

    const user:?User = await getUser(email);
    if (!user || !user.hash || !(await bcrypt.compare(password, user.hash))) {
      return forwardToLogin(res, callbackUri, 'Invalid username or password');
    }

    // Note: this session user is only for direct login to the
    // auth server. It is NOT populated for token-based access.
    req.session.user = user;

    res.redirect(callbackUri);
  });

  router.get('/authorize', checkLogin, async (req, res, next) => {
    const authResult = await (oauth.authorize({
      // Session user is used during authorisation flow
      authenticateHandler: {
        handle: req => req.session.user
      },
      allowEmptyState: true
    })(withDefaultScope(req), res));
    return next();
  });

  router.post('/token', async (req, res) => {
    try {
      const token = await oauth.token({
        requireClientAuthentication: { 
          authorization_code: false,
          refresh_token: false
        }
      })(withDefaultScope(req), res);
      return res.status(200).json(token);
    }
    catch (err) {
      return res.status(500).json(err)
    }
  });

  return router;
};