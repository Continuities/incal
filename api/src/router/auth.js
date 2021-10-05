/**
 * OAuth2 endpoints
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import { promises as fs } from 'fs';
import { getClient } from '../service/client.js';

import type { Router } from 'express';

const CSRF_TOKEN_EXPIRES_IN = 1000 * 60 * 2;// 2 minutes

const getRequestUrl = req => `${req.protocol}://${req.get('host')}${req.originalUrl}`;
const removeUserAction =  url => url.replace(/&?(deny|agree|logout|csrfToken)=[^&]+/g, '');
const forwardToLogin = async (res, callbackUri) => 
  forwardToView(res, 'login', {
    //when logged in successfully, redirect back to the original request url
    callbackUri: Buffer.from(callbackUri, 'utf-8').toString('base64'),
    loginUrl: '/oauth/login'
  });

const forwardToView = async (res, viewName:string, viewModel:{[string]:string}) => {
  const template = (await fs.readFile(new URL(`../../static/${viewName}.html`, import.meta.url))).toString();
  if (!template) {
    return res.sendStatus(500);
  }
  const rendered = Object
    .entries(viewModel)
    .reduce((html, variable) => html.replace(
        new RegExp(`{${variable[0]}}`, 'g'), 
        variable[1]
      ), template);

	res.status(200).send(rendered);
};

export default (oauth:any) => {
  const router:Router<> = express.Router();

  const checkLogin = async (req, res, next) => {
    const { client_id, csrfToken, scope } = req.query;
    const { user, userConfirmCsrfToken } = req.session;

    // TODO: Scope security
    const scopes = scope
      .split(',')
      .map(s => s.trim());
    
    if (!client_id) {
      return res.sendStatus(400);
    }
    const client = getClient(client_id);
    if (!client) {
      return res.sendStatus(401);
    }

    const requestUrl = removeUserAction(getRequestUrl(req));

    if (!user) {
      return await forwardToLogin(res, requestUrl);
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
          'username': user.username
        });
      } 
      else if (logout) {
        ctx.user = null;
        return await forwardToLogin(res, requestUrl);
      } 
      else {
        await next();
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
      'username': user.username,
      'scopes': scopes
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

    // TODO: Actual user lookup
    const user = { username: email };
    if (!user) {
      return forwardToLogin(req, callbackUri);
    }

    // login successfully
    req.session.user = user;
    res.redirect(callbackUri);
  });

  router.get('/authorize', checkLogin, oauth.authorize({
    //implement a handle(request, response):user method to get the authenticated user (aka. the logged-in user)
    //Note: this is where the node-oauth2-server get to know what the currently logined-in user is.
    authenticateHandler: {
      handle: (req, res) => !req.session.user ? null : ({ 
        username: req.user.username 
      })
    }
  }));

  router.post('/token', async (req, res) => {
    // TODO
    res.sendStatus(501);
  });

  return router;
};