/**
 * OAuth2 Model
 * https://oauth2-server.readthedocs.io/en/latest/model/overview.html
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import { 
  getAccessToken,
  getRefreshToken,
  getAuthorisationCode,
  saveAccessToken,
  saveRefreshToken,
  saveAuthorisationCode,
  revokeRefreshToken,
  revokeAuthorisationCode
} from './service/auth.js';
import { getClient } from './service/client.js';
import { getUser } from './service/user.js';

import type {
  AccessToken,
  RefreshToken,
  AuthorisationCode
} from './service/auth.js';
import type { Client } from './service/client.js';
import type { User } from './service/user.js';

export default {
    
    /**
    * the node-oauth2-server use this method to get detail infomation of an access token previously stored used OauthModel.prototype.saveToken
    * @param {String} accessToken - the access token string
    * @return {Object} token - the access token object, containing (at least) the following infomation, or null if the access token desen't not exist:
    *         {String} token.accessToken - the access token string
    *         {Date} token.accessTokenExpiresAt - the exact time when the access token should expire
    *         {String} token.scope - access scope of this access token
    *         {Object} token.client - the oauth client
    *         {String} token.client.id - string id of the oauth client
    *         {Object} token.user - the user which this access token represents, this data structure of the user object is not part of the Model Specification, and what it should be is completely up to you.
    */
    getAccessToken: async (accessToken:string):Promise<?AccessToken> => getAccessToken(accessToken),

    /**
    * the node-oauth2-server use this method to get detail information of a refresh token previously stored used OauthModel.prototype.saveToken.
    * <b>Note:</b>refresh token is used by the oauth client to request for a new access token, and it's actually not related to any access token in any way, so access tokens and refresh tokens should be stored and retrieved independent to each other.
    * @param {String} refreshToken - the refresh token string
    * @return {Object} token - the token object containing (at least) the following infomation, or null if the refresh token doesn't exist:
    *        {String} token.refreshToken - the refresh token string
    *        {Date} token.refreshTokenExpiresAt - the exact time when the refresh token should expire
    *        {String} scope - the access scope
    *        {Object} client - the client object
    *        {String} client.id - the id of the client
    *        {Object} user - the user object
    *        {String} user.email - identifier of the user
    */
    getRefreshToken: async (refreshToken:string):Promise<?RefreshToken> => getRefreshToken(refreshToken),

    /**
    * the node-oauth2-server use this method to get detail information of a authorization code previously stored used OauthModel.prototype.saveAuthorizationCode.
    * @param {String} authorizationCode - the authorization code string
    * @return {Object} code - the code object containing the following information, or null if the authorization code doesn't exist
    *         {String} code - the authorization code string
    *         {Date} expiresAt - the exact time when the code should expire
    *         {String} redirectUri - the redirect_uri query parameter of the '/oauth/authorize' request, indicating where to redirect to with the code
    *         {String} scope - the authorization scope deciding the access scope of the access token requested by the oauth client using this code
    *         {Object} client - the client object
    *         {String} client.id - the client id
    *         {Object} user - the user object
    *         {String} user.email - the user identifier
    */
    getAuthorizationCode: async (authCode:string):Promise<?AuthorisationCode> => getAuthorisationCode(authCode),

    /**
    * the node-oauth2-server use this method to get detail infomation of a registered client.
    * @param {String} clientId - the client id
    * @param {String} [clientSecret] - the client secret, used in the token granting phase to authenticate the oauth client
    * @return {Object} client - the client object, containing (at least) the following infomation, or null if the client is not a valid registered client or the client secret doesn't match the clientId:
    *         {String} client.id - the client id
    *         {Array<String>} grants - an array of grant types allowed for this client, allowed values are: authorization_code | client_credentials | password | refresh_token
    *         {Array<String>} redirectUris - an array of urls (of the client) that allowed for redirecting to by the oauth server
    *         {Number} [accessTokenLifetime=3600] - define the lifetime of an access token in seconds, default is 1 hour
    *         {Number} [refreshTokenLifetime=3600 * 24 * 14] - define the lifetime of an refresh token in seconds, default is 2 weeks
    */
    getClient: async (clientId:string, clientSecret:?string = null):Promise<?Client> => {
      const client = await getClient(clientId);
      if (!client || client.clientSecret !== clientSecret) {
        return null;
      }
      return client;
    },

    /**
    * the node-oauth2-server uses this method to save an access token and an refresh token(if refresh token enabled) during the token granting phase.
    * @param {Object} token - the token object
    * @param {String} token.accessToken - the access token string
    * @param {Date} token.accessTokenExpiresAt - @see OauthModel.prototype.getAccessToken
    * @param {String} token.refreshToken - the refresh token string
    * @param {Date} token.refreshTokenExpiresAt - @see OauthModel.prototype.getRefreshToken
    * @param {String} token.scope - the access scope
    * @param {Object} client - the client object - @see OauthModel.prototype.getClient
    * @param {String} client.id - the client id
    * @param {Object} user - the user object @see OauthModel.prototype.getAccessToken
    * @param {String} user.email - the user identifier
    * @return {Object} token - the token object saved, same as the parameter 'token'
    */
    saveToken: async (token:any, client:any, user:any):Promise<any> => {

      const commonInfo = {
        client: client.id,
        user: user.email,
        scope: token.scope
      };

      await saveAccessToken({
        ...commonInfo,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt
      });

      if (token.refreshToken) {
        await saveRefreshToken({
          ...commonInfo,
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: token.refreshTokenExpiresAt
        });
      }

      return {
        ...token,
        ...commonInfo
      };
    },

    /**
    * the node-oauth2-server uses this method to save an authorization code.
    * @param {Object} code - the authorization code object
    * @param {String} code.authorizationCode - the authorization code string
    * @param {Date} code.expiresAt - the time when the code should expire
    * @param {String} code.redirectUri - where to redirect to with the code
    * @param {String} [code.scope] - the authorized access scope
    * @param {Object} client - the client object
    * @param {String} client.id - the client id
    * @param {Object} user - the user object
    * @param {String} user.email - the user identifier
    * @return {Object} code - the code object saved
    */
    saveAuthorizationCode: async (code:$Shape<AuthorisationCode>, client:Client, user:User): Promise<$Shape<AuthorisationCode>> => {

      const savedCode = {
        ...code,
        client,
        user
      };

      await saveAuthorisationCode(savedCode);
      return savedCode;
    },

    /**
    * the node-oauth2-server uses this method to revoke a refresh token(remove it from the store).
    * Note: by default, the node-oauth2-server enable the option 'alwaysIssueNewRefreshToken', meaning that every time you use a refresh token to get a new access token, the refresh token itself will be revoked and a new one will be issued along with the access token (you can set the option through OAuth2Server.token(request, response, [options], [callback]) or KoaOAuthServer.token(options)).
    * If you always use the refresh token before it expires, then there will always be a valid refresh token in the store(unless you explictly revoke it). This makes it seem like refresh token never expires.
    * @param {Object} token - the token object
    * @param {String} token.refreshToken - the refresh token string
    * @param {Date} token.refreshTokenExpiresAt - the exact time when the refresh token should expire
    * @param {String} token.scope - the access scope
    * @param {Object} token.client - the client object
    * @param {String} token.client.id - the client id
    * @param {Object} token.user - the user object
    * @param {String} token.user.email - the user identifier
    * @return {Boolean} - true if the token was successfully revoked, false if the token cound not be found
    */
    revokeToken: async (token:$Shape<RefreshToken>):Promise<empty> => revokeRefreshToken(token),

    /**
    * the node-oauth2-server uses this method to revoke a authorization code(mostly when it expires)
    * @param {Object} code - the authorization code object
    * @param {String} authorizationCode - the authorization code string
    * @param {Date} code.expiresAt -the time when the code should expire
    * @param {String} code.redirectUri - the redirect uri
    * @param {String} code.scope - the authorization scope
    * @param {Object} code.client - the client object
    * @param {String} code.client.id - the client id
    * @param {Object}  code.user - the user object
    * @param {String} code.user.email - the user identifier
    * @return {Boolean} - true if the code is revoked successfully,false if the could not be found
    */
    revokeAuthorizationCode: async (code:$Shape<AuthorisationCode>):Promise<empty> => revokeAuthorisationCode(code),

    /**
    * the node-oauth2-server uses this method to determine what scopes should be granted to the client for accessing the user's data.
    * for example, the client requests the oauth server for an access token of the 'user_info:read,user_info_write' scope, 
    * but the oauth server determine by this method that only the 'user_info:read' scope should be granted.
    * @param {Object} user - the user whose data the client wants to access
    * @param {String} user.email - the user identifier
    * @param {Object} userClient - the oauth client
    * @param {String} userClient.id - the client id
    * @param {String} scope - the scopes which the client requested for
    * @return {String} validScopes - the actual valid scopes for the client, null if no valid scopes for the client
    */
    validateScope: async (user:User, userClient:$Shape<Client>, scope:string):Promise<?string> => {
      if (!scope) {
        return null;
      }
      
      const client = await getClient(userClient.id);

      if(!client || !client.scopes.length){
        return null;
      }

      const validScopes = new Set(client.scopes);
      const scopes = scope
        .split(',')
        .map(s => s.trim())
        .filter(s => validScopes.has(s));

      return scope.length ? scopes.join(',') : null;
    },

    /**
    * node-oauth2-server uses this method in authentication handler to verify whether an access token from a request is sufficient to the 'scope' declared for the requested resources
    * @param {Object} accessToken - the accessToken object
    * @param {String} accessToken.accessToken - the accessToken string
    * @param {Date} accessToken.accessTokenExpiresAt - the time when the token should expire
    * @param {String} accessToken.scope - the granted access scope of the token
    * @param {Object} accessToken.client - the client object
    * @param {String} accessToken.client.id - the client id
    * @param {Object} accessTokne.user - the user object
    * @param {String} accessToken.user.email - the user identifier
    * @param {String} scope - the scope declared for the resources
    * @return {Boolean} - true if the access token has sufficient access scopes for the resources
    */
    verifyScope: async (accessToken:AccessToken, scope:string):Promise<boolean> => {

      if (!scope) {
        //no scope declared for the resource, free to access
        return true;
      }

      if (!accessToken.scope) {
        return false;
      }

      const validScopes = new Set(scope.split(',').map(s => s.trim()));
      const scopes = accessToken.scope.split(',').map(s => s.trim());

      return scopes.some(s => validScopes.has(s));
    },

    // not implemented, only needed when using 'password' grant type
    getUser: null,

    // not implemented, only needed when using 'client_credentials' grant type
    getUserFromClient: null,

    // not implemented, use default
    generateAccessToken: undefined,

    // not implemented, use default
    generateRefreshToken: undefined,

    // not implemented, use default
    generateAuthorizationCode: undefined,

  };