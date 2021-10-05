/**
 * Authorisation service
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React, { createContext, useContext } from 'react';

const CLIENT = {
  id: 'test',
  clientSecret: 'test_secret',
  name: 'Test Client',
  grantType: 'authorization_code',
  redirectUri: 'www.google.com' // TODO
};

type Props = {|
  children: React$Node
|}

const AuthContext = createContext();
export const AuthProvider = ({ children }:Props):React$Node => {
  return (
    <AuthContext.Provider value=''>
      {children}
    </AuthContext.Provider>
  )
};