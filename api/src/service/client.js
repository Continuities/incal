/**
 * Fetches client data
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

export type Client = {|
  id: string,
	clientSecret: string,
	name: string,
	grants: Array<string>,
	redirectUris: Array<string>,
  scopes: Array<string>,
	accessTokenLifetime?: number, // default is 3600,
	refreshTokenLifetime?: number // default is 2 weeks
|};

const CLIENTS:{ [string]: Client } = {
  'test': {
    id: 'test',
    clientSecret: 'test_secret',
    name: 'Test Client',
    scopes: [ 'user_info:read' ],
    grants: [ 'authorization_code', 'refresh_token' ],
    redirectUris: [ 'www.google.com '] // TODO
  }
};

export const getClient = async (id:string):Promise<?Client> => CLIENTS[id];