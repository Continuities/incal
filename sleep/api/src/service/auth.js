/**
 * Handles authentication with authWeb
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import fetch from 'node-fetch';
import { Client, Server } from '../config.js';
import { URLSearchParams } from "url";

const AUTH_URI = process.env.AUTH_URI || 'http://localhost'

export const getUser = async ():any => {
  const headers:any = {
    Accept: 'application/json'
  };
  return (await fetch(
    `${AUTH_URI}/user`, 
    { headers }
  )).json();
};

export const getToken = async (code:string, state:string):Promise<any> => {
  // TODO: Compare state
  const body = {
    grant_type: Client.grantType,
    client_id: Client.id,
    client_secret: Client.clientSecret,
    redirect_uri: Client.redirectUri
  };

  console.log(`Getting acccess token from ${Server.tokenUri} with code ${code}`);

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
    console.log(e);
    return null;
  }
};