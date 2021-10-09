/**
 * Authorisation service
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React, { 
  createContext, 
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react';
import { useLocation } from 'react-router-dom';
import { useStorage } from '@service/storage';
import Login from '@view/Login';
import { useGet } from '@service/api';

import type { 
  User, 
  ApiResponse 
} from '@service/api';

const TOKEN_KEY = 'nyanyan';

export const isExpired = (token:Token):bool => 
  Date.now() > new Date(token.expires_at);

export type Token = {|
  access_token: string,
  expires_in: number,
  expires_at: string, // ISO datestring
  refresh_token: string,
  scope: string,
  token_type: string
|};

type Props = {|
  children: React$Node
|}

type Config = {|
  [string]: string
|};

export const ServerConfig:Config = {
  authorize: process.env.AUTH_URI || '',
  token: process.env.TOKEN_URI || ''
};

export const ClientConfig:Config = {
  id: 'spa',
  name: 'Test SPA',
  grantType: 'authorization_code',
  redirectUri: process.env.APP_URI || ''
};

export const getToken = async (code:string, verify:string):Promise<Token> => {

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: ClientConfig.id,
    redirect_uri: ClientConfig.redirectUri,
    code_verifier: verify
  }).toString();

  const response = await fetch(ServerConfig.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });

  if (!response.ok) {
    throw `oath/token failed: ${response.statusText}`;
  }

  return response.json();
};

const refreshAccessToken = async (token:Token):Promise<Token> => {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token,
    client_id: ClientConfig.id,
    redirect_uri: ClientConfig.redirectUri
  }).toString();

  const response = await fetch(ServerConfig.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });

  if (!response.ok) {
    throw `oath/token failed: ${response.statusText}`;
  }

  return response.json();
};

type TokenData = [
  ?Token,
  () => void, // refresh token call
  () => void // delete token call
];

type UserData = [
  ApiResponse<User>,
  () => void // refresh user
]

const UserContext = createContext<UserData>([ { status: 'pending' }, () => {} ]);
export const UserProvider = ({ children }: Props):React$Node => {
  const [ resend, setResend ] = useState(0);
  const userResponse = useGet<User>('/user', resend);

  const doResend = () => setResend(r => r + 1);

  return (
    <UserContext.Provider value={[ userResponse, doResend ]}>
      {children}
    </UserContext.Provider>
  );
}

const TokenContext = createContext<TokenData>([ null, () => {}, () => {} ]);
export const TokenProvider = ({ children }:Props):React$Node => {
  const [ token, setToken, removeToken ] = useStorage<Token>(TOKEN_KEY);
  const code = new URLSearchParams(useLocation().search).get('code') || null;
  const [ isRefreshing, setRefreshing ] = useState(false);

  const storeToken = token => {
    setToken({
      ...token,
      expires_at: String(new Date(Date.now() + (token.expires_in * 1000)))
    });
  };

  const refreshToken = () => {
    if (!token || isRefreshing) { 
      return; 
    }
    setRefreshing(true);
    refreshAccessToken(token)
      .then(setToken)
      .catch(e => {
        console.error('Failed to refresh access token', e);
        removeToken();
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  return (
    <TokenContext.Provider value={[ token, refreshToken, removeToken ]}>
      { token ? children : (
        <Login onLogin={storeToken}/>
      )}
    </TokenContext.Provider>
  );
};

export const useToken = ():[ ?Token, () => void, () => void ] => useContext(TokenContext);

export const useCurrentUser = ():UserData => useContext(UserContext);