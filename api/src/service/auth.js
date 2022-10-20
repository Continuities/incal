/**
 * Service for interacting with auth tokens
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import MemoryStore from 'simple-memory-storage';
import collection from './db.js';
import { getClient } from './client.js';
import { getUser } from './user.js';
import type { Client } from './client.js';
import type { User } from './user.js';

type BaseAuth = {|
  client: Client,
  user: User
|};

type BaseToken = {|
  ...BaseAuth,
  scope: string
|};

export type AccessToken = {|
  ...BaseToken,
  accessToken: string,
  accessTokenExpiresAt: Date
|};

export type RefreshToken = {|
  ...BaseToken,
  refreshToken: string,
  refreshTokenExpiresAt: Date
|};

export type AuthorisationCode = {|
  ...BaseAuth,
  authorizationCode: string,
  expiresAt: Date
|};

const accessStore = new MemoryStore();
const refreshStore = new MemoryStore();
const authStore = new MemoryStore();

const populate = async <T> (token:any):Promise<T> => {
  return token && {
    ...token,
    client: typeof token.client === 'string' ? await getClient(token.client) : token.client,
    user: typeof token.user === 'string' ? await getUser(token.user) : token.user,
  };
};

const depopulate = (token:{ ...BaseAuth }):any => {
  return token && {
    ...token,
    client: typeof token.client === 'string' ? token.client : token.client.id,
    user: typeof token.user === 'string' ? token.user : token.user.email
  };
};

export const getAccessToken = async (tokenString:string):Promise<?AccessToken> => populate(accessStore.get(tokenString));
export const getRefreshToken = async (tokenString:string):Promise<?RefreshToken> => populate(refreshStore.get(tokenString));
export const getAuthorisationCode = async (authString:string):Promise<?AuthorisationCode> => populate(authStore.get(authString));

export const saveAccessToken = async (token:AccessToken):Promise<empty> => 
  accessStore.setExpiration(token.accessToken, depopulate(token), token.accessTokenExpiresAt);
export const saveRefreshToken = async (token:RefreshToken):Promise<empty> => 
  refreshStore.setExpiration(token.refreshToken, depopulate(token), token.refreshTokenExpiresAt);
export const saveAuthorisationCode = async (code:AuthorisationCode):Promise<empty> => 
  authStore.setExpiration(code.authorizationCode, depopulate(code), code.expiresAt);

export const revokeRefreshToken = async (token:RefreshToken):Promise<empty> => refreshStore.remove(token.refreshToken);
export const revokeAuthorisationCode = async (code:AuthorisationCode):Promise<empty> => authStore.remove(code.authorizationCode);