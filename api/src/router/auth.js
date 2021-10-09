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
import { getUser, saveUser } from '../service/user.js';

import type { User } from '../service/user.js';

const COMMUNITY_NAME = process.env.COMMUNITY_NAME || 'authWeb';
const CSRF_TOKEN_EXPIRES_IN = 1000 * 60 * 2;// 2 minutes

const getRequestUrl = req => `${req.protocol}://${req.get('host')}${req.originalUrl}`;
const removeUserAction =  url => url.replace(/&?(deny|agree|logout|csrfToken)=[^&]+/g, '');
const forwardToLogin = async (res, callbackUri) => 
  forwardToView(res, 'login', {
    community: COMMUNITY_NAME,
    callbackUri: Buffer.from(callbackUri, 'utf-8').toString('base64'),
    loginUrl: `${String(process.env.SERVER_URI)}/oauth/login`,
    registerUrl: `${String(process.env.SERVER_URI)}/oauth/register`
  });

const forwardToView = async (res, viewName:string, viewModel:{[string]:string}) => {
  // $FlowFixMe[incompatible-use] Flow doesn't know about import.meta.url
  const template = (await fs.readFile(new URL(`../../static/${viewName}.html`, import.meta.url))).toString();
  if (!template) {
    return res.sendStatus(500);
  }
  const rendered = Object
    .entries(viewModel)
    .reduce((html, variable) => html.replace(
        new RegExp(`%{${variable[0]}}`, 'g'), 
        String(variable[1])
      ), template);

	res.status(200).send(rendered);
};

const isExpired = (time) => Date.now() >= time;

export default (oauth:any):any => {
  const router = express.Router();

  const checkLogin = async (req, res, next) => {
    const { 
      client_id, 
      csrfToken, 
      scope, 
      agree, 
      deny, 
      logout 
    } = req.query;
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

  router.post('/register', async (req, res) => {
    const { 
      callback_uri, 
      email,
      firstname,
      lastname,
      password 
    } = req.body;

    if (!callback_uri || !email || !password || !firstname || !lastname){
      return res.sendStatus(400);
    }
    const callbackUri = Buffer.from(callback_uri, 'base64').toString('utf-8');
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    if (isNaN(saltRounds)) {
      throw 'Non-numeric SALT_ROUNDS specified';
    }
    const hash = await bcrypt.hash(password, saltRounds);
    try {
      await saveUser({
        email,
        firstname,
        lastname,
        hash,
        sponsors: []
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
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return forwardToLogin(res, callbackUri);
    }

    // login successfully
    req.session.user = user;
    res.redirect(callbackUri);
  });

  router.get('/authorize', checkLogin, async (req, res, next) => {
    const authResult = await (oauth.authorize({
      // provide the session user to oauth-server
      authenticateHandler: {
        handle: req => req.session.user
      }
    })(req, res));
    return next();
  });

  router.post('/token', async (req, res) => {
    try {
      const token = await oauth.token({
        requireClientAuthentication: { 
          authorization_code: false,
          refresh_token: false
        }
      })(req, res);
      return res.status(200).json(token);
    }
    catch (err) {
      return res.status(500).json(err)
    }
  });

  return router;
};