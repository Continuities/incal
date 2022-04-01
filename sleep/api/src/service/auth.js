/**
 * Handles authentication with INCAL
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import fetch from 'node-fetch';
import { Client, Server } from '../config.js';
import { URLSearchParams } from "url";
import { Rule, evaluate } from './rule.js';

import type { RulePredicate } from './rule.js';
import type { Tagged } from '../util.js';
import type { Place } from './place.js';

const USER_URI = String(process.env.USER_URI);

const withTags = (user:any):Tagged<any> => {
  if (!user) {
    return null;
  }
  const tags:Array<string> = user.tags || [];

  if (user.isAnchor || user.sponsors.length >= process.env.SPONSORS_TO_CREATE) {
    tags.push('can-create');
  }

  return {
    ...user,
    tags
  };
};

export const getUser = async (token:?Token = null):Promise<any> => {
  const headers:any = {
    Accept: 'application/json'
  };
  if (token) {
    headers.Authorization = `${token.token_type} ${token.access_token}`;
  }
  const r = await fetch(
    USER_URI, 
    { headers }
  );

  if (!r.ok) {
    console.log(r.status, r.statusText);
    return null;
  }

  return withTags(await r.json());
};

export type Token = {|
  access_token: string,
  token_type: 'Bearer',
  expires_in: number,
  scope: string
|};

export const getToken = async (code:string):Promise<?Token> => {
  const body = {
    code,
    grant_type: Client.grantType,
    client_id: Client.id,
    client_secret: Client.clientSecret,
    redirect_uri: Client.redirectUri
  };

  try {
    const r = await fetch(Server.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body).toString()
    });

    if (!r.ok) {
      console.log(r.status, r.statusText);
      return null;
    }

    return r.json();
  }
  catch (e) {
    console.error(e);
    return null;
  }
};

type SecuredOptions = {|
  user?: (req:any) => Promise<?any>, // User resolver
  place?: (req:any) => Promise<?Tagged<Place>> // Place resolver
|};

export const secured = (rules?:Array<RulePredicate>, options?:SecuredOptions):any => async (req, res, next) => {
  const user = options?.user ? await options.user(req) : req.user;
  const place = options?.place ? await options.place(req) : null;
  if (!evaluate(rules || [ Rule.minSponsors(1) ], user, place)) {
    return res.sendStatus(401);
  }
  next();
};