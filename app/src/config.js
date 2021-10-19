/**
 * description
 * @author mtownsend
 * @since November 30, 2021
 * @flow
 **/

import type { 
  ClientConfig, 
  ServerConfig 
} from '@authweb/service';

export const Server:ServerConfig = {
  authorizeUri: process.env.REACT_APP_AUTH_URI || '',
  tokenUri: process.env.REACT_APP_TOKEN_URI || ''
};

export const Client:ClientConfig = {
  id: 'dashboard',
  grantType: 'authorization_code',
  scope: 'user_info:read,user_info:write',
  redirectUri: process.env.REACT_APP_APP_URI || ''
};