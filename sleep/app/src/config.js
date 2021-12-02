/**
 * Config stuff
 * @author mtownsend
 * @since December 10, 2021
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
  id: 'sleep',
  grantType: 'authorization_code',
  scope: 'user_info:read',
  redirectUri: `${(process.env.REACT_APP_API_URI || 'http://localhost')}/login`
};

