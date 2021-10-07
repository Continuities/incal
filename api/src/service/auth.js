/**
 * Service for interacting with auth tokens
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import MemoryStore from 'simple-memory-storage';
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

export const getAccessToken = async (tokenString:string):Promise<?AccessToken> => populate(await accessStore.get(tokenString));
export const getRefreshToken = async (tokenString:string):Promise<?RefreshToken> => populate(await refreshStore.get(tokenString));
export const getAuthorisationCode = async (authString:string):Promise<?AuthorisationCode> => populate(await authStore.get(authString));

export const saveAccessToken = async (token:AccessToken) => 
  accessStore.setExpiration(token.accessToken, depopulate(token), token.accessTokenExpiresAt);
export const saveRefreshToken = async (token:RefreshToken) => 
  refreshStore.setExpiration(token.refreshToken, depopulate(token), token.refreshTokenExpiresAt);
export const saveAuthorisationCode = async (code:AuthorisationCode) => 
  authStore.setExpiration(code.authorizationCode, depopulate(code), code.expiresAt);

export const revokeRefreshToken = async (token:RefreshToken) => refreshStore.remove(token.refreshToken);
export const revokeAuthorisationCode = async (code:AuthorisationCode) => authStore.remove(code.authorizationCode);