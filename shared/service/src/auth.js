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
import {
  generateRandomString,
  pkceChallengeFromVerifier
} from './crypto';
import { useStorage } from './storage';
import { useGet } from './api';

import type { 
  User, 
  ApiResponse 
} from './api';

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

export type ServerConfig = {|
  authorizeUri: string,
  tokenUri: string
|};

export type ClientConfig = {|
  id: string,
  grantType: string,
  scope: string,
  redirectUri: string
|};

type AuthType = {|
  getToken: (string, string) => Promise<Token>,
  refreshAccessToken: Token => Promise<Token>
|};
const Auth = (clientConfig:ClientConfig, serverConfig:ServerConfig):AuthType => ({

  getToken: async (code:string, verify:string):Promise<Token> => {

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientConfig.id,
      redirect_uri: clientConfig.redirectUri,
      code_verifier: verify
    }).toString();

    const response = await fetch(serverConfig.tokenUri, {
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
  },

  refreshAccessToken: async (token:Token):Promise<Token> => {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: clientConfig.id,
      redirect_uri: clientConfig.redirectUri
    }).toString();

    const response = await fetch(serverConfig.tokenUri, {
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
  }
});

type TokenData = {|
  token: ?Token,
  auth: ?AuthType,
  storeToken: ?Token => void
|};
const EMPTY_DATA:TokenData = {
  token: null,
  auth: null,
  storeToken: () => {}
}

type TokenInterface = {|
  token: ?Token,
  refreshToken: () => void,
  deleteToken: () => void
|};

type UserData = [
  ApiResponse<User>,
  () => void // refresh user
]

type UserProps = {|
  children: React$Node
|};
const UserContext = createContext<UserData>([ { status: 'pending' }, () => {} ]);
export const UserProvider = ({ children }: UserProps):React$Node => {
  const [ resend, setResend ] = useState(0);
  const userResponse = useGet<User>('/user', resend);

  const doResend = () => setResend(r => r + 1);

  return (
    <UserContext.Provider value={[ userResponse, doResend ]}>
      {children}
    </UserContext.Provider>
  );
}

type TokenProps = {|
  children: React$Node,
  client: ClientConfig,
  server: ServerConfig
|};
const TokenContext = createContext<TokenData>(EMPTY_DATA);
export const TokenProvider = ({ children, client, server }:TokenProps):React$Node => {
  const [ token, setToken, removeToken ] = useStorage<Token>(TOKEN_KEY);
  const auth = useMemo(() => Auth(client, server), [ client, server ]);

  const storeToken = token => {
    if (!token) {
      removeToken();
      return;
    }
    setToken({
      ...token,
      expires_at: String(new Date(Date.now() + (token.expires_in * 1000)))
    });
  };

  const onCode = async code => {

  };

  return (
    <TokenContext.Provider 
      value={{
        token,
        auth,
        storeToken
      }}
    >
      { children }
    </TokenContext.Provider>
  );
};

type OAuthValues = {|
  params: string,
  onCode: string => Promise<void>
|};
export const useOAuth2 = (client:ClientConfig):OAuthValues => {
  const [ state, setState ] = useState(generateRandomString());
  const [ verify, setVerify ] = useState(generateRandomString());
  const [ challenge, setChallenge ] = useState(generateRandomString());
  const { auth, storeToken } = useContext(TokenContext);


  useEffect(() => {
    verify && pkceChallengeFromVerifier(verify)
      .then(setChallenge);
  }, [ verify ]);

  const params = useMemo(() => 
    new URLSearchParams({
      response_type: 'code',
      client_id: client.id,
      state,
      scope: client.scope,
      redirect_uri: client.redirectUri,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    }).toString(),
    [ state, challenge, verify ]
  );

  const onCode = async code => {
    const token = await auth?.getToken(code, verify);
    storeToken(token);
  };

  return {
    params,
    onCode
  };
};

export const useToken = ():TokenInterface => {
  const { token, auth, storeToken } = useContext(TokenContext);
  const [ isRefreshing, setRefreshing ] = useState(false);

  const deleteToken = () => storeToken(null);

  const refreshToken = () => {
    if (!token || !auth || isRefreshing) { 
      return; 
    }
    setRefreshing(true);
    auth.refreshAccessToken(token)
      .then(storeToken)
      .catch(e => {
        console.error('Failed to refresh access token', e);
        deleteToken();
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  return {
    token,
    refreshToken,
    deleteToken
  };
};

// TODO: This should be in API?
export const useCurrentUser = ():UserData => useContext(UserContext);