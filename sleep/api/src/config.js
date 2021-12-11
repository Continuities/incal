/**
 * description
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

export const Server:any = {
  tokenUri: process.env.TOKEN_URI || ''
};

export const Client:any = {
  id: 'sleep',
  grantType: 'authorization_code',
  scope: 'user_info:read',
  clientSecret: 'nyanyanyan',
  redirectUri: process.env.APP_URI
};