/**
 * Handles authentication with authWeb
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import fetch from 'node-fetch';

const AUTH_URI = process.env.AUTH_URI || 'http://localhost'

export const getUser = async ():any => {
  const headers:any = {
    Accept: 'application/json'
  };
  return (await fetch(
    `${AUTH_URI}/user`, 
    { headers }
  )).json();
};