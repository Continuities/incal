/**
 * Authorisation service
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React, { 
  createContext, 
  useContext
} from 'react';
import { useLocation } from 'react-router-dom';
import { useStorage } from '@service/storage';
import Login from '@view/Login';

const TOKEN_KEY = 'nyanyan';

const isExpired = (time:Date):bool => Date.now() > time;

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

const AuthContext = createContext([ null, () => {} ]);
export const AuthProvider = ({ children }:Props):React$Node => {
  const [ token, setToken, removeToken ] = useStorage<Token>(TOKEN_KEY);
  const code = new URLSearchParams(useLocation().search).get('code') || null;

  const onLogin = token => {
    setToken({
      ...token,
      expires_at: String(new Date(Date.now() + (token.expires_in * 1000)))
    });
  };

  return (
    <AuthContext.Provider value={[ token, removeToken ]}>
      { token ? children : (
        <Login onLogin={onLogin}/>
      )}
    </AuthContext.Provider>
  );
};

export const useToken = ():[ ?Token, () => void ] => useContext(AuthContext);