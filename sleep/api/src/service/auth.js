/**
 * Handles authentication with authWeb
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import fetch from 'node-fetch';
import { Client, Server } from '../config.js';
import { URLSearchParams } from "url";

const USER_URI = String(process.env.USER_URI);

export const getUser = async (token:?Token = null):any => {
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

  return r.json();
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