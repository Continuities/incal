/**
 * Fetches client data
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

export type Client = {|
  id: string,
	clientSecret: ?string,
	name: string,
	grants: Array<string>,
	redirectUris: Array<string>,
  scopes: Array<string>,
	accessTokenLifetime?: number, // default is 3600,
	refreshTokenLifetime?: number // default is 2 weeks
|};

const CLIENTS:{ [string]: Client } = {
  'dashboard': {
    id: 'dashboard',
    name: 'Account Dashboard',
    clientSecret: null,
    scopes: [ 'user_info:read', 'user_info:write' ],
    grants: [ 'authorization_code', 'refresh_token' ],
    redirectUris: [ process.env.SERVER_URI || '' ],
    // short-lived refresh token of 1 day, since it lives in an SPA
    refreshTokenLifetime: 60 * 60 * 24
  },

  'sleep': {
    id: 'sleep',
    name: 'Sleep',
    clientSecret: 'nyanyanyan',
    scopes: [ 'user_info:read' ],
    grants: [ 'authorization_code', 'refresh_token' ],
    redirectUris: [ 
      'http://localhost/sleep/api/login'
    ]
  }
};

export const getClient = async (id:string):Promise<?Client> => CLIENTS[id];