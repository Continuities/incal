/**
 * OAuth2 endpoints
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import { promises as fs } from 'fs';
import { getClient } from '../service/client.js';
import { getUser } from '../service/user.js';

import type { Router } from 'express';

const CSRF_TOKEN_EXPIRES_IN = 1000 * 60 * 2;// 2 minutes

const getRequestUrl = req => `${req.protocol}://${req.get('host')}${req.originalUrl}`;
const removeUserAction =  url => url.replace(/&?(deny|agree|logout|csrfToken)=[^&]+/g, '');
const forwardToLogin = async (res, callbackUri) => 
  forwardToView(res, 'login', {
    //when logged in successfully, redirect back to the original request url
    callbackUri: Buffer.from(callbackUri, 'utf-8').toString('base64'),
    loginUrl: 'http://localhost:8080/oauth/login'
  });

const forwardToView = async (res, viewName:string, viewModel:{[string]:string}) => {
  const template = (await fs.readFile(new URL(`../../static/${viewName}.html`, import.meta.url))).toString();
  if (!template) {
    return res.sendStatus(500);
  }
  const rendered = Object
    .entries(viewModel)
    .reduce((html, variable) => html.replace(
        new RegExp(`%{${variable[0]}}`, 'g'), 
        variable[1]
      ), template);

	res.status(200).send(rendered);
};

const isExpired = (time) => Date.now() >= time;

export default (oauth:any) => {
  const router:Router<> = express.Router();

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

    const scopes = scope
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

    return forwardToView(res, 'user-confirm', {
      'oauthUri': requestUrl,
      'csrfToken': sessCsrfToken.token,
      'clientName': client.name,
      'firstname': user.firstname,
      'scope': scope
    });
  };

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

    const user = await getUser(email);
    if (!user) {
      return forwardToLogin(req, callbackUri);
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
          authorization_code: false 
        }
      })(req, res);
      return res.status(200).json(token);
    }
    catch {
      return res.status(500).json(err)
    }
  });

  return router;
};